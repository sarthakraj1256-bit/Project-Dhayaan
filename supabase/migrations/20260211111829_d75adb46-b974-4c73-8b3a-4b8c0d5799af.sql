
-- Create temple jap reports table
CREATE TABLE public.temple_jap_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  temple_id text NOT NULL,
  temple_name text NOT NULL,
  mantra_name text NOT NULL,
  chant_count integer NOT NULL DEFAULT 0,
  dedication text,
  notes text,
  deadline date,
  reference_id text NOT NULL DEFAULT ('JAP-' || substr(gen_random_uuid()::text, 1, 8)),
  status text NOT NULL DEFAULT 'submitted',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.temple_jap_reports ENABLE ROW LEVEL SECURITY;

-- Users can insert their own reports
CREATE POLICY "Users can insert their own temple jap reports"
  ON public.temple_jap_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own reports
CREATE POLICY "Users can view their own temple jap reports"
  ON public.temple_jap_reports FOR SELECT
  USING (auth.uid() = user_id);

-- Users can delete their own reports
CREATE POLICY "Users can delete their own temple jap reports"
  ON public.temple_jap_reports FOR DELETE
  USING (auth.uid() = user_id);
