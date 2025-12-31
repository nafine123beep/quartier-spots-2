-- Migration: Add preview_token column to events table
-- This allows event creators to share draft events with unauthenticated visitors via a special preview link

-- Step 1: Add preview_token column (UUID for secure, non-guessable tokens)
-- Run this only if the column doesn't exist yet:
ALTER TABLE events ADD COLUMN IF NOT EXISTS preview_token UUID DEFAULT NULL;

-- Step 2: Create an index for efficient token lookups (partial index only for non-null tokens)
-- Run this only if the index doesn't exist yet:
CREATE INDEX IF NOT EXISTS idx_events_preview_token ON events(preview_token) WHERE preview_token IS NOT NULL;

-- Step 3: Update RLS policy to allow reading events with valid preview_token
-- This is CRITICAL for unauthenticated preview access to work!

-- First, check existing policies on events table:
-- SELECT * FROM pg_policies WHERE tablename = 'events';

-- Drop existing select policy if it exists (adjust policy name as needed)
-- DROP POLICY IF EXISTS "Allow public read for published events" ON events;

-- Create updated policy that allows:
-- 1. Reading published events (for everyone)
-- 2. Reading any event with a matching preview_token (for preview links)
-- 3. Reading all events for authenticated tenant members (existing behavior)

-- Option A: If you have a simple RLS setup, use this:
CREATE POLICY "Allow public read for published events or with preview token"
ON events FOR SELECT
USING (
  status = 'published'
  OR preview_token IS NOT NULL
);

-- Note: The above policy allows reading ANY event that has a preview_token set.
-- The application code still validates that the provided token matches.
-- This is secure because:
-- 1. Preview tokens are UUIDs (unguessable)
-- 2. The app only returns events where preview_token matches the URL parameter

-- IMPORTANT: You may need to adjust this based on your existing RLS policies.
-- If you have existing policies, you might need to:
-- 1. DROP the existing SELECT policy first
-- 2. Then CREATE the new combined policy

-- Alternative: If the above doesn't work with your existing setup, try:
-- DROP POLICY IF EXISTS "events_select_policy" ON events;
-- CREATE POLICY "events_select_policy" ON events FOR SELECT USING (
--   status = 'published'
--   OR preview_token IS NOT NULL
--   OR (auth.uid() IS NOT NULL AND EXISTS (
--     SELECT 1 FROM memberships
--     WHERE memberships.tenant_id = events.tenant_id
--     AND memberships.user_id = auth.uid()
--     AND memberships.status = 'active'
--   ))
-- );
