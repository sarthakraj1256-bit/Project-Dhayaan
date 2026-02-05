-- Create storage bucket for garden screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('garden-screenshots', 'garden-screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view garden screenshots (public bucket)
CREATE POLICY "Garden screenshots are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'garden-screenshots');

-- Allow authenticated users to upload their garden screenshots
CREATE POLICY "Users can upload their own garden screenshots"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'garden-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own screenshots
CREATE POLICY "Users can delete their own garden screenshots"
ON storage.objects FOR DELETE
USING (bucket_id = 'garden-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create table to track shared gardens
CREATE TABLE public.shared_gardens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  screenshot_url TEXT NOT NULL,
  plant_count INTEGER DEFAULT 0,
  flourishing_count INTEGER DEFAULT 0,
  garden_level INTEGER DEFAULT 1,
  total_karma_earned INTEGER DEFAULT 0,
  share_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shared_gardens ENABLE ROW LEVEL SECURITY;

-- Anyone can view shared gardens
CREATE POLICY "Shared gardens are publicly viewable"
ON public.shared_gardens FOR SELECT
USING (true);

-- Users can create their own shared gardens
CREATE POLICY "Users can share their own gardens"
ON public.shared_gardens FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own shared gardens
CREATE POLICY "Users can delete their own shared gardens"
ON public.shared_gardens FOR DELETE
USING (auth.uid() = user_id);