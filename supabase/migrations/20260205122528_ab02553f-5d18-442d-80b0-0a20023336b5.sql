-- Create garden_stats table for leaderboard
CREATE TABLE public.garden_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  total_plants INTEGER NOT NULL DEFAULT 0,
  flourishing_plants INTEGER NOT NULL DEFAULT 0,
  total_karma_earned INTEGER NOT NULL DEFAULT 0,
  achievements_unlocked INTEGER NOT NULL DEFAULT 0,
  garden_level INTEGER NOT NULL DEFAULT 1,
  total_water_used INTEGER NOT NULL DEFAULT 0,
  last_active_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.garden_stats ENABLE ROW LEVEL SECURITY;

-- Public read access for leaderboard
CREATE POLICY "Garden stats are publicly viewable for leaderboard"
ON public.garden_stats
FOR SELECT
USING (true);

-- Users can insert their own stats
CREATE POLICY "Users can insert their own garden stats"
ON public.garden_stats
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own stats
CREATE POLICY "Users can update their own garden stats"
ON public.garden_stats
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_garden_stats_updated_at
BEFORE UPDATE ON public.garden_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();