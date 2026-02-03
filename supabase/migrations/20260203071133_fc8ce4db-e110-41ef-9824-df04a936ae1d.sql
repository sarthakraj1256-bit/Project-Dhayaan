-- Create stress_metrics table for aggregating stress reduction data
CREATE TABLE public.stress_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  initial_stress INTEGER NOT NULL CHECK (initial_stress >= 1 AND initial_stress <= 10),
  final_stress INTEGER NOT NULL CHECK (final_stress >= 1 AND final_stress <= 10),
  stress_reduction INTEGER,
  intent_tag TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.stress_metrics ENABLE ROW LEVEL SECURITY;

-- Allow anonymous reads for public statistics (no PII exposed except optional name)
CREATE POLICY "Allow public read access for statistics"
ON public.stress_metrics
FOR SELECT
USING (true);

-- Allow inserts from edge functions (service role)
CREATE POLICY "Allow service role inserts"
ON public.stress_metrics
FOR INSERT
WITH CHECK (true);

-- Create index for faster aggregation by intent_tag
CREATE INDEX idx_stress_metrics_intent_tag ON public.stress_metrics(intent_tag);
CREATE INDEX idx_stress_metrics_created_at ON public.stress_metrics(created_at DESC);