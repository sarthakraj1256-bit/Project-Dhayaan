-- Create favorites table for saving frequency + atmosphere combinations
CREATE TABLE public.session_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  frequency_value NUMERIC NOT NULL,
  frequency_name TEXT NOT NULL,
  frequency_category TEXT NOT NULL,
  atmosphere_id TEXT NOT NULL DEFAULT 'none',
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.session_favorites ENABLE ROW LEVEL SECURITY;

-- Users can view their own favorites
CREATE POLICY "Users can view their own favorites"
ON public.session_favorites
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own favorites
CREATE POLICY "Users can create their own favorites"
ON public.session_favorites
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own favorites
CREATE POLICY "Users can delete their own favorites"
ON public.session_favorites
FOR DELETE
USING (auth.uid() = user_id);

-- Users can update their own favorites
CREATE POLICY "Users can update their own favorites"
ON public.session_favorites
FOR UPDATE
USING (auth.uid() = user_id);