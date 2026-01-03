-- Storage policies for event-images bucket

-- Policy 1: Public read access
CREATE POLICY "Public read access for event images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'event-images');

-- Policy 2: Authenticated users can upload
CREATE POLICY "Authenticated users can upload event images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'event-images');

-- Policy 3: Authenticated users can update
CREATE POLICY "Authenticated users can update event images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'event-images');

-- Policy 4: Authenticated users can delete
CREATE POLICY "Authenticated users can delete event images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'event-images');
