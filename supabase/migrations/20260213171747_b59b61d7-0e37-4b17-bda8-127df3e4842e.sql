
-- Drop and recreate with new return type
DROP FUNCTION IF EXISTS public.get_shared_garden(uuid);

CREATE OR REPLACE FUNCTION public.get_shared_garden(garden_id uuid)
RETURNS TABLE(
  id uuid,
  screenshot_url text,
  plant_count integer,
  flourishing_count integer,
  garden_level integer,
  total_karma_earned integer,
  share_message text,
  created_at timestamptz,
  is_anonymous boolean
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
    CASE WHEN sg.is_anonymous THEN NULL ELSE sg.plant_count END,
    CASE WHEN sg.is_anonymous THEN NULL ELSE sg.flourishing_count END,
    CASE WHEN sg.is_anonymous THEN NULL ELSE sg.garden_level END,
    CASE WHEN sg.is_anonymous THEN NULL ELSE sg.total_karma_earned END,
    sg.share_message,
    sg.created_at,
    sg.is_anonymous
  FROM public.shared_gardens sg
  WHERE sg.id = garden_id;
END;
$$;
