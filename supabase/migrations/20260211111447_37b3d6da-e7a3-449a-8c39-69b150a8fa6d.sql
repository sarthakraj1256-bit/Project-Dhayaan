
-- Add escrow and terms fields to jap_requests
ALTER TABLE public.jap_requests 
  ADD COLUMN IF NOT EXISTS escrow_amount numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS escrow_status text DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS auto_complete_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS requester_terms_accepted_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS performer_terms_accepted_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS sankalpa_receipt jsonb DEFAULT NULL;

-- Create a function to auto-complete requests after 48-hour verification window
CREATE OR REPLACE FUNCTION public.check_auto_complete_requests()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.jap_requests
  SET status = 'completed',
      escrow_status = 'released'
  WHERE status = 'proof_submitted'
    AND auto_complete_at IS NOT NULL
    AND auto_complete_at <= now();
END;
$$;

-- Create a function to handle non-performance refunds (deadline passed with no proof)
CREATE OR REPLACE FUNCTION public.check_expired_requests()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.jap_requests
  SET status = 'refunded',
      escrow_status = 'refunded'
  WHERE status IN ('accepted', 'in_progress')
    AND deadline IS NOT NULL
    AND deadline < CURRENT_DATE
    AND escrow_status = 'held';
END;
$$;
