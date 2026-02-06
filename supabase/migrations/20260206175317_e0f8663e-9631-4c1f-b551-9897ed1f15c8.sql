-- Fix the views to use SECURITY INVOKER instead of default SECURITY DEFINER
-- Drop and recreate with explicit security invoker

DROP VIEW IF EXISTS public.garden_leaderboard;
DROP VIEW IF EXISTS public.temple_stories_public;

-- Recreate garden_leaderboard view with SECURITY INVOKER
CREATE VIEW public.garden_leaderboard 
WITH (security_invoker = true) AS
SELECT 
  id,
  display_name,
  avatar_url,
  total_plants,
  flourishing_plants,
  total_karma_earned,
  achievements_unlocked,
  garden_level,
  total_water_used,
  last_active_at
FROM public.garden_stats
ORDER BY total_karma_earned DESC, achievements_unlocked DESC;

-- Recreate temple_stories_public view with SECURITY INVOKER
CREATE VIEW public.temple_stories_public 
WITH (security_invoker = true) AS
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
WHERE ts.is_approved = true;

-- Re-grant SELECT on views
GRANT SELECT ON public.garden_leaderboard TO anon, authenticated;
GRANT SELECT ON public.temple_stories_public TO anon, authenticated;