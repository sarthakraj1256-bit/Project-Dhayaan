
-- Remove the overly permissive flagging policy
DROP POLICY "Any authenticated user can flag shorts" ON public.shorts_metadata;

-- Create a security definer function for flagging instead
CREATE OR REPLACE FUNCTION public.flag_short(p_short_id uuid, p_reason text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  IF LENGTH(p_reason) > 500 THEN
    RAISE EXCEPTION 'Reason too long';
  END IF;

  UPDATE public.shorts_metadata SET is_flagged = true WHERE id = p_short_id;
  
  INSERT INTO public.shorts_reports (short_id, reporter_id, reason)
  VALUES (p_short_id, auth.uid(), p_reason);
END;
$$;
