
-- Bhakti Shorts metadata table
CREATE TABLE public.shorts_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_url text NOT NULL,
  creator_id uuid NOT NULL,
  caption text,
  likes_count integer NOT NULL DEFAULT 0,
  tags text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  is_flagged boolean NOT NULL DEFAULT false
);

ALTER TABLE public.shorts_metadata ENABLE ROW LEVEL SECURITY;

-- Anyone can read non-flagged shorts
CREATE POLICY "Anyone can read non-flagged shorts"
  ON public.shorts_metadata FOR SELECT
  USING (is_flagged = false);

-- Authenticated users can insert
CREATE POLICY "Authenticated users can insert shorts"
  ON public.shorts_metadata FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

-- Creator can update own shorts
CREATE POLICY "Creator can update own shorts"
  ON public.shorts_metadata FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id);

-- Creator can delete own shorts
CREATE POLICY "Creator can delete own shorts"
  ON public.shorts_metadata FOR DELETE
  TO authenticated
  USING (auth.uid() = creator_id);

-- Admin can update any short (for flagging)
CREATE POLICY "Any authenticated user can flag shorts"
  ON public.shorts_metadata FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Shorts comments table
CREATE TABLE public.shorts_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  short_id uuid NOT NULL REFERENCES public.shorts_metadata(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.shorts_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read comments"
  ON public.shorts_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert comments"
  ON public.shorts_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON public.shorts_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Shorts likes table (track individual likes)
CREATE TABLE public.shorts_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  short_id uuid NOT NULL REFERENCES public.shorts_metadata(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(short_id, user_id)
);

ALTER TABLE public.shorts_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read likes"
  ON public.shorts_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can like"
  ON public.shorts_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike"
  ON public.shorts_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Shorts reports table
CREATE TABLE public.shorts_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  short_id uuid NOT NULL REFERENCES public.shorts_metadata(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.shorts_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can report"
  ON public.shorts_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

-- RPC to toggle like and update count atomically
CREATE OR REPLACE FUNCTION public.toggle_short_like(p_short_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  already_liked boolean;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.shorts_likes
    WHERE short_id = p_short_id AND user_id = auth.uid()
  ) INTO already_liked;

  IF already_liked THEN
    DELETE FROM public.shorts_likes WHERE short_id = p_short_id AND user_id = auth.uid();
    UPDATE public.shorts_metadata SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = p_short_id;
    RETURN false;
  ELSE
    INSERT INTO public.shorts_likes (short_id, user_id) VALUES (p_short_id, auth.uid());
    UPDATE public.shorts_metadata SET likes_count = likes_count + 1 WHERE id = p_short_id;
    RETURN true;
  END IF;
END;
$$;

-- Storage bucket for bhakti shorts videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('bhakti-shorts', 'bhakti-shorts', true, 104857600, ARRAY['video/mp4', 'video/quicktime']);

-- Storage RLS policies
CREATE POLICY "Anyone can read bhakti shorts"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'bhakti-shorts');

CREATE POLICY "Authenticated users can upload bhakti shorts"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'bhakti-shorts');

CREATE POLICY "Users can delete own bhakti shorts"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'bhakti-shorts' AND (storage.foldername(name))[1] = auth.uid()::text);
