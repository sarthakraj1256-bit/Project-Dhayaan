-- Drop the overly permissive public read policy
DROP POLICY IF EXISTS "Allow public read access for statistics" ON public.stress_metrics;

-- Create a more restrictive policy that only allows reading aggregated statistics
-- Note: We'll use an RPC function for safe statistics access instead of direct table access
-- For now, completely restrict direct SELECT access since all reads should go through aggregation

-- Create a security definer function to safely aggregate statistics
CREATE OR REPLACE FUNCTION public.get_stress_statistics()
RETURNS TABLE (
  total_participants bigint,
  average_stress_reduction numeric,
  intent_breakdown jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::bigint as total_participants,
    ROUND(AVG(stress_reduction)::numeric, 1) as average_stress_reduction,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'intent_tag', intent_tag,
          'count', cnt,
          'avg_reduction', avg_red
        )
      )
      FROM (
        SELECT 
          intent_tag,
          COUNT(*) as cnt,
          ROUND(AVG(stress_reduction)::numeric, 1) as avg_red
        FROM stress_metrics
        WHERE intent_tag IS NOT NULL AND stress_reduction IS NOT NULL
        GROUP BY intent_tag
      ) sub
    ) as intent_breakdown
  FROM stress_metrics
  WHERE stress_reduction IS NOT NULL;
END;
$$;