-- Fix overpermissive jap-proofs storage SELECT policy
DROP POLICY IF EXISTS "Users can view relevant proofs" ON storage.objects;

CREATE POLICY "Only request participants can view proofs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'jap-proofs' 
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR
    auth.uid() IN (
      SELECT jr.requester_id FROM public.jap_requests jr
      JOIN public.jap_proofs jp ON jr.id = jp.request_id
      WHERE jp.performer_id::text = (storage.foldername(name))[1]
    )
  )
);