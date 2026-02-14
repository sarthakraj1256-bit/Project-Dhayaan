
-- Add input validation to get_garden_leaderboard
CREATE OR REPLACE FUNCTION public.get_garden_leaderboard(limit_count integer DEFAULT 50)
RETURNS TABLE(id uuid, display_name text, avatar_url text, total_plants integer, flourishing_plants integer, total_karma_earned integer, achievements_unlocked integer, garden_level integer, total_water_used integer, last_active_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF limit_count IS NULL OR limit_count < 1 THEN limit_count := 50; END IF;
  IF limit_count > 100 THEN limit_count := 100; END IF;

  RETURN QUERY
  SELECT gs.id, gs.display_name, gs.avatar_url, gs.total_plants, gs.flourishing_plants, gs.total_karma_earned, gs.achievements_unlocked, gs.garden_level, gs.total_water_used, gs.last_active_at
  FROM public.garden_stats gs
  ORDER BY gs.total_karma_earned DESC, gs.achievements_unlocked DESC
  LIMIT limit_count;
END;
$$;

-- Add input validation to get_temple_stories_public
CREATE OR REPLACE FUNCTION public.get_temple_stories_public(temple_filter text DEFAULT NULL, limit_count integer DEFAULT 50)
RETURNS TABLE(id uuid, temple_id text, story text, rating integer, photos text[], created_at timestamp with time zone, author_name text, author_avatar text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF limit_count IS NULL OR limit_count < 1 THEN limit_count := 50; END IF;
  IF limit_count > 100 THEN limit_count := 100; END IF;
  IF temple_filter IS NOT NULL AND LENGTH(temple_filter) > 200 THEN
    RAISE EXCEPTION 'temple_filter too long';
  END IF;

  RETURN QUERY
  SELECT ts.id, ts.temple_id, ts.story, ts.rating, ts.photos, ts.created_at, p.display_name as author_name, p.avatar_url as author_avatar
  FROM public.temple_stories ts
  LEFT JOIN public.profiles p ON ts.user_id = p.user_id
  WHERE ts.is_approved = true AND (temple_filter IS NULL OR ts.temple_id = temple_filter)
  ORDER BY ts.created_at DESC
  LIMIT limit_count;
END;
$$;

-- Add input validation to get_jap_leaderboard
CREATE OR REPLACE FUNCTION public.get_jap_leaderboard(mantra_filter text DEFAULT NULL, limit_count integer DEFAULT 50)
RETURNS TABLE(id uuid, display_name text, avatar_url text, total_chants bigint, mantra_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF limit_count IS NULL OR limit_count < 1 THEN limit_count := 50; END IF;
  IF limit_count > 100 THEN limit_count := 100; END IF;
  IF mantra_filter IS NOT NULL AND LENGTH(mantra_filter) > 200 THEN
    RAISE EXCEPTION 'mantra_filter too long';
  END IF;

  RETURN QUERY
  SELECT gen_random_uuid() as id, p.display_name, p.avatar_url, SUM(je.chant_count)::BIGINT as total_chants, je.mantra_name
  FROM public.jap_entries je
  LEFT JOIN public.profiles p ON je.user_id = p.user_id
  WHERE (mantra_filter IS NULL OR je.mantra_name = mantra_filter)
  GROUP BY je.user_id, je.mantra_name, p.display_name, p.avatar_url
  ORDER BY total_chants DESC
  LIMIT limit_count;
END;
$$;

-- Fix story_reactions: restrict SELECT to own reactions, add RPC for counts
DROP POLICY IF EXISTS "Anyone can view story reactions" ON public.story_reactions;

CREATE POLICY "Users can view their own reactions"
ON public.story_reactions FOR SELECT
USING (auth.uid() = user_id);

-- RPC to get aggregate reaction counts (no user_id exposed)
CREATE OR REPLACE FUNCTION public.get_story_reaction_counts(story_ids uuid[])
RETURNS TABLE(story_id uuid, reaction_type text, reaction_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF array_length(story_ids, 1) IS NULL OR array_length(story_ids, 1) > 100 THEN
    RAISE EXCEPTION 'Invalid story_ids array';
  END IF;

  RETURN QUERY
  SELECT sr.story_id, sr.reaction_type, COUNT(*)::bigint as reaction_count
  FROM public.story_reactions sr
  WHERE sr.story_id = ANY(story_ids)
  GROUP BY sr.story_id, sr.reaction_type;
END;
$$;
