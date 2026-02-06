-- Create anonymized view for garden leaderboard (hides user_id from public)
CREATE OR REPLACE VIEW public.garden_leaderboard AS
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

-- Create anonymized view for temple stories (hides user_id, keeps author identity via display_name)
CREATE OR REPLACE VIEW public.temple_stories_public AS
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

-- Grant SELECT on views to anon and authenticated roles
GRANT SELECT ON public.garden_leaderboard TO anon, authenticated;
GRANT SELECT ON public.temple_stories_public TO anon, authenticated;

-- Update RLS on garden_stats: remove public SELECT, add owner-only SELECT
DROP POLICY IF EXISTS "Garden stats are publicly viewable for leaderboard" ON public.garden_stats;
CREATE POLICY "Users can view their own garden stats" 
ON public.garden_stats 
FOR SELECT 
USING (auth.uid() = user_id);

-- Update RLS on temple_stories: remove public SELECT, add owner-only SELECT for managing their stories
DROP POLICY IF EXISTS "Anyone can view approved stories" ON public.temple_stories;
CREATE POLICY "Users can view their own stories" 
ON public.temple_stories 
FOR SELECT 
USING (auth.uid() = user_id);