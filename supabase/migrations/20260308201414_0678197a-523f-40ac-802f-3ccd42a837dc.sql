
CREATE TABLE public.saved_krishna_guidance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  question text NOT NULL,
  greeting text,
  guidance text NOT NULL,
  verse_chapter integer,
  verse_number integer,
  verse_sanskrit text,
  verse_translation text,
  verse_meaning text,
  closing text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_krishna_guidance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own saved guidance"
  ON public.saved_krishna_guidance FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own saved guidance"
  ON public.saved_krishna_guidance FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved guidance"
  ON public.saved_krishna_guidance FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
