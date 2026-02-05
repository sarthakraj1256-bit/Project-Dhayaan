-- Create temple favorites table
CREATE TABLE public.temple_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  temple_id TEXT NOT NULL,
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, temple_id)
);

-- Enable Row Level Security
ALTER TABLE public.temple_favorites ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own favorites" 
ON public.temple_favorites 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorites" 
ON public.temple_favorites 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own favorites" 
ON public.temple_favorites 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" 
ON public.temple_favorites 
FOR DELETE 
USING (auth.uid() = user_id);