-- Create the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create user_spiritual_progress table to track levels, XP, and chakras
CREATE TABLE public.user_spiritual_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  karma_points INTEGER NOT NULL DEFAULT 0,
  current_level TEXT NOT NULL DEFAULT 'novice',
  total_meditation_minutes INTEGER NOT NULL DEFAULT 0,
  total_chanting_sessions INTEGER NOT NULL DEFAULT 0,
  total_mantra_lessons INTEGER NOT NULL DEFAULT 0,
  total_games_played INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  unlocked_chakras TEXT[] DEFAULT '{}',
  unlocked_environments TEXT[] DEFAULT '{"cosmic_void"}',
  unlocked_wallpapers TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_spiritual_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own progress"
ON public.user_spiritual_progress
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
ON public.user_spiritual_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
ON public.user_spiritual_progress
FOR UPDATE
USING (auth.uid() = user_id);

-- Create breath_flow_sessions table for game tracking
CREATE TABLE public.breath_flow_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  duration_seconds INTEGER NOT NULL,
  max_distance_reached INTEGER NOT NULL DEFAULT 0,
  breath_consistency_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  karma_earned INTEGER NOT NULL DEFAULT 0,
  chakra_fragments_earned INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.breath_flow_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own breath flow sessions"
ON public.breath_flow_sessions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own breath flow sessions"
ON public.breath_flow_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create trigger to update updated_at
CREATE TRIGGER update_user_spiritual_progress_updated_at
BEFORE UPDATE ON public.user_spiritual_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();