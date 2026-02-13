
-- 1. Fix get_jap_leaderboard: drop and recreate without user_id exposure
DROP FUNCTION IF EXISTS public.get_jap_leaderboard(text, integer);

CREATE FUNCTION public.get_jap_leaderboard(mantra_filter text DEFAULT NULL::text, limit_count integer DEFAULT 50)
RETURNS TABLE(id uuid, display_name text, avatar_url text, total_chants bigint, mantra_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gen_random_uuid() as id,
    p.display_name,
    p.avatar_url,
    SUM(je.chant_count)::BIGINT as total_chants,
    je.mantra_name
  FROM public.jap_entries je
  LEFT JOIN public.profiles p ON je.user_id = p.user_id
  WHERE (mantra_filter IS NULL OR je.mantra_name = mantra_filter)
  GROUP BY je.user_id, je.mantra_name, p.display_name, p.avatar_url
  ORDER BY total_chants DESC
  LIMIT limit_count;
END;
$$;

-- 2. Restrict darshan chat SELECT to authenticated users only
DROP POLICY IF EXISTS "Anyone can view chat messages" ON public.darshan_chat_messages;
CREATE POLICY "Authenticated users can view chat messages"
ON public.darshan_chat_messages
FOR SELECT
TO authenticated
USING (true);

-- 3. Allow authenticated users to read basic profile info
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Authenticated users can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- 4. Allow authenticated users to view approved temple stories
DROP POLICY IF EXISTS "Users can view their own stories" ON public.temple_stories;
CREATE POLICY "Authenticated users can view approved stories"
ON public.temple_stories
FOR SELECT
TO authenticated
USING (is_approved = true);
