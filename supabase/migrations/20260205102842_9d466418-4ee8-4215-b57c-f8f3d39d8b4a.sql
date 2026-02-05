-- Create mantra progress tracking table
CREATE TABLE public.mantra_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mantra_id TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_syllables INTEGER[] NOT NULL DEFAULT '{}',
  total_repetitions INTEGER NOT NULL DEFAULT 0,
  last_practiced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, mantra_id)
);

-- Enable RLS
ALTER TABLE public.mantra_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own progress"
ON public.mantra_progress
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
ON public.mantra_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
ON public.mantra_progress
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress"
ON public.mantra_progress
FOR DELETE
USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_mantra_progress_updated_at
BEFORE UPDATE ON public.mantra_progress
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();