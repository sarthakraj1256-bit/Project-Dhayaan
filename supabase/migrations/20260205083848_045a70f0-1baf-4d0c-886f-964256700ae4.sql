-- Add explicit DENY SELECT policy to stress_metrics for documentation and security
-- This makes it explicit that direct reads are not allowed (only via RPC function)
CREATE POLICY "Deny direct reads - use RPC for statistics"
ON public.stress_metrics
FOR SELECT
USING (false);