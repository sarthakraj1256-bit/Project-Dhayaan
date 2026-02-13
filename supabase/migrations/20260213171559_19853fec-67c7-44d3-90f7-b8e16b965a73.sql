
-- Drop the existing public SELECT policy
DROP POLICY IF EXISTS "Shared gardens are publicly viewable" ON public.shared_gardens;

-- Create owner-only SELECT policy
CREATE POLICY "Users can view their own shared gardens"
ON public.shared_gardens
FOR SELECT
USING (auth.uid() = user_id);

-- Create a secure RPC function for public viewing that excludes user_id
CREATE OR REPLACE FUNCTION public.get_shared_garden(garden_id uuid)
RETURNS TABLE(
  id uuid,
  screenshot_url text,
  plant_count integer,
  flourishing_count integer,
  garden_level integer,
  total_karma_earned integer,
  share_message text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    sg.id,
    sg.screenshot_url,
    sg.plant_count,
    sg.flourishing_count,
    sg.garden_level,
    sg.total_karma_earned,
    sg.share_message,
    sg.created_at
  FROM public.shared_gardens sg
  WHERE sg.id = garden_id;
END;
$$;
