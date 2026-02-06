-- Create RPC function to get public leaderboard data (no user_id exposed)
CREATE OR REPLACE FUNCTION public.get_garden_leaderboard(limit_count integer DEFAULT 50)
RETURNS TABLE (
  id uuid,
  display_name text,
  avatar_url text,
  total_plants integer,
  flourishing_plants integer,
  total_karma_earned integer,
  achievements_unlocked integer,
  garden_level integer,
  total_water_used integer,
  last_active_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gs.id,
    gs.display_name,
    gs.avatar_url,
    gs.total_plants,
    gs.flourishing_plants,
    gs.total_karma_earned,
    gs.achievements_unlocked,
    gs.garden_level,
    gs.total_water_used,
    gs.last_active_at
  FROM public.garden_stats gs
  ORDER BY gs.total_karma_earned DESC, gs.achievements_unlocked DESC
  LIMIT limit_count;
END;
$$;

-- Create RPC function to get public temple stories (no user_id exposed)
CREATE OR REPLACE FUNCTION public.get_temple_stories_public(
  temple_filter text DEFAULT NULL,
  limit_count integer DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  temple_id text,
  story text,
  rating integer,
  photos text[],
  created_at timestamptz,
  author_name text,
  author_avatar text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ts.id,
    ts.temple_id,
    ts.story,
    ts.rating,
    ts.photos,
    ts.created_at,
    p.display_name as author_name,
    p.avatar_url as author_avatar
  FROM public.temple_stories ts
  LEFT JOIN public.profiles p ON ts.user_id = p.user_id
  WHERE ts.is_approved = true
    AND (temple_filter IS NULL OR ts.temple_id = temple_filter)
  ORDER BY ts.created_at DESC
  LIMIT limit_count;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_garden_leaderboard(integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_temple_stories_public(text, integer) TO anon, authenticated;

-- Drop the views since we're using RPC functions instead
DROP VIEW IF EXISTS public.garden_leaderboard;
DROP VIEW IF EXISTS public.temple_stories_public;