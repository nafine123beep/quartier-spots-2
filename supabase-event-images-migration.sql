-- Event Images Migration
-- Run this in your Supabase SQL Editor

-- Step 1: Create the event_images table
CREATE TABLE IF NOT EXISTS event_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  filename TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  is_cover BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster lookups by event_id
CREATE INDEX IF NOT EXISTS idx_event_images_event_id ON event_images(event_id);

-- Step 2: Enable RLS
ALTER TABLE event_images ENABLE ROW LEVEL SECURITY;

-- Step 3: RLS Policies

-- Anyone can view event images (public)
CREATE POLICY "Anyone can view event images"
  ON event_images
  FOR SELECT
  USING (true);

-- Authenticated users can insert images for events they have access to
CREATE POLICY "Users can insert images for their tenant events"
  ON event_images
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events e
      JOIN memberships m ON m.tenant_id = e.tenant_id
      WHERE e.id = event_id
      AND m.user_id = auth.uid()
    )
  );

-- Authenticated users can update images for events they have access to
CREATE POLICY "Users can update images for their tenant events"
  ON event_images
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events e
      JOIN memberships m ON m.tenant_id = e.tenant_id
      WHERE e.id = event_id
      AND m.user_id = auth.uid()
    )
  );

-- Authenticated users can delete images for events they have access to
CREATE POLICY "Users can delete images for their tenant events"
  ON event_images
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events e
      JOIN memberships m ON m.tenant_id = e.tenant_id
      WHERE e.id = event_id
      AND m.user_id = auth.uid()
    )
  );

-- Step 4: Create storage bucket (run in Supabase Dashboard > Storage or via API)
-- Note: You need to create the bucket manually in Supabase Dashboard:
-- 1. Go to Storage
-- 2. Click "New bucket"
-- 3. Name: "event-images"
-- 4. Public bucket: Yes
-- 5. File size limit: 5MB
-- 6. Allowed MIME types: image/jpeg, image/png, image/webp

-- Storage bucket policies (apply in Supabase Dashboard > Storage > Policies)
-- These SQL statements create the policies:

-- Allow public read access to event images
-- CREATE POLICY "Public read access for event images"
--   ON storage.objects
--   FOR SELECT
--   USING (bucket_id = 'event-images');

-- Allow authenticated users to upload images
-- CREATE POLICY "Authenticated users can upload event images"
--   ON storage.objects
--   FOR INSERT
--   TO authenticated
--   WITH CHECK (bucket_id = 'event-images');

-- Allow authenticated users to delete their uploaded images
-- CREATE POLICY "Authenticated users can delete event images"
--   ON storage.objects
--   FOR DELETE
--   TO authenticated
--   USING (bucket_id = 'event-images');
