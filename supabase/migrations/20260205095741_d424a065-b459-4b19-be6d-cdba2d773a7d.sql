-- Create meditation_goals table
CREATE TABLE public.meditation_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('weekly', 'monthly')),
  target_minutes INTEGER NOT NULL CHECK (target_minutes > 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, goal_type)
);

-- Enable RLS
ALTER TABLE public.meditation_goals ENABLE ROW LEVEL SECURITY;

-- Users can view their own goals
CREATE POLICY "Users can view their own goals"
ON public.meditation_goals FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own goals
CREATE POLICY "Users can insert their own goals"
ON public.meditation_goals FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own goals
CREATE POLICY "Users can update their own goals"
ON public.meditation_goals FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own goals
CREATE POLICY "Users can delete their own goals"
ON public.meditation_goals FOR DELETE
USING (auth.uid() = user_id);

-- Create index
CREATE INDEX idx_meditation_goals_user_id ON public.meditation_goals(user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_meditation_goals_updated_at
BEFORE UPDATE ON public.meditation_goals
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();