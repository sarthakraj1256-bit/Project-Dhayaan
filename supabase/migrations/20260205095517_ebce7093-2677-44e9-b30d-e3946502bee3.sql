-- Create meditation_sessions table to track user session history
CREATE TABLE public.meditation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  frequency_value NUMERIC NOT NULL,
  frequency_name TEXT NOT NULL,
  frequency_category TEXT NOT NULL,
  atmosphere_id TEXT NOT NULL DEFAULT 'none',
  duration_seconds INTEGER NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.meditation_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view their own sessions
CREATE POLICY "Users can view their own sessions"
ON public.meditation_sessions
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own sessions
CREATE POLICY "Users can insert their own sessions"
ON public.meditation_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own sessions
CREATE POLICY "Users can delete their own sessions"
ON public.meditation_sessions
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_meditation_sessions_user_id ON public.meditation_sessions(user_id);
CREATE INDEX idx_meditation_sessions_started_at ON public.meditation_sessions(started_at DESC);