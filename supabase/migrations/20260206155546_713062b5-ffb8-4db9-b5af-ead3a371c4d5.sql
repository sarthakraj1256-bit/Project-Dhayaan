-- Create storage bucket for pre-generated mantra audio
INSERT INTO storage.buckets (id, name, public)
VALUES ('mantra-audio', 'mantra-audio', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to mantra audio
CREATE POLICY "Mantra audio is publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'mantra-audio');

-- Allow service role to upload audio (for edge function)
CREATE POLICY "Service role can upload mantra audio"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'mantra-audio');

CREATE POLICY "Service role can update mantra audio"
ON storage.objects FOR UPDATE
USING (bucket_id = 'mantra-audio');

CREATE POLICY "Service role can delete mantra audio"
ON storage.objects FOR DELETE
USING (bucket_id = 'mantra-audio');