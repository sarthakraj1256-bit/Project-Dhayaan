-- Create temple stories table for devotee experiences
CREATE TABLE public.temple_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  temple_id TEXT NOT NULL,
  story TEXT NOT NULL,
  visit_date DATE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_approved BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.temple_stories ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved stories
CREATE POLICY "Anyone can view approved stories"
ON public.temple_stories
FOR SELECT
USING (is_approved = true);

-- Users can insert their own stories
CREATE POLICY "Users can insert their own stories"
ON public.temple_stories
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own stories
CREATE POLICY "Users can update their own stories"
ON public.temple_stories
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own stories
CREATE POLICY "Users can delete their own stories"
ON public.temple_stories
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_temple_stories_updated_at
BEFORE UPDATE ON public.temple_stories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();