-- Add photos column to temple_stories table
ALTER TABLE public.temple_stories 
ADD COLUMN photos TEXT[] DEFAULT '{}';

-- Create storage bucket for temple story photos
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('temple-story-photos', 'temple-story-photos', true, 5242880);

-- Allow anyone to view photos (public bucket)
CREATE POLICY "Anyone can view temple story photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'temple-story-photos');

-- Allow authenticated users to upload their own photos
CREATE POLICY "Users can upload temple story photos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'temple-story-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own photos
CREATE POLICY "Users can delete their own temple story photos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'temple-story-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);