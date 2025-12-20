-- =====================================================
-- Event Management Updates - Map Center & Status
-- Run these SQL statements in your Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. Update event status enum
-- =====================================================

-- First, update existing 'active' events to 'published'
UPDATE events
SET status = 'published'
WHERE status = 'active';

-- Drop the old enum if it exists and create new one
DO $$ BEGIN
  -- Drop the old constraint if it exists
  ALTER TABLE events DROP CONSTRAINT IF EXISTS events_status_check;

  -- Add new constraint with updated values
  ALTER TABLE events ADD CONSTRAINT events_status_check
  CHECK (status IN ('draft', 'published', 'archived'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;


-- =====================================================
-- 2. Add map center fields to events table
-- =====================================================

-- Add map center latitude
ALTER TABLE events ADD COLUMN IF NOT EXISTS map_center_lat DOUBLE PRECISION;

-- Add map center longitude
ALTER TABLE events ADD COLUMN IF NOT EXISTS map_center_lng DOUBLE PRECISION;

-- Add map center address (for reference/display)
ALTER TABLE events ADD COLUMN IF NOT EXISTS map_center_address TEXT;

-- Add comment to explain these fields
COMMENT ON COLUMN events.map_center_lat IS 'Default map center latitude for event location';
COMMENT ON COLUMN events.map_center_lng IS 'Default map center longitude for event location';
COMMENT ON COLUMN events.map_center_address IS 'Address or area name for map center reference';


-- =====================================================
-- 3. Update RLS policies for new status
-- =====================================================

-- Drop old policy if exists
DROP POLICY IF EXISTS "Anyone can view active events" ON events;

-- Create new policy for published events
CREATE POLICY "Anyone can view published events"
ON events FOR SELECT
USING (status = 'published');

-- Policy for admins to preview draft events (they can already see via membership policy)
-- This is already covered by the existing "Tenant members can view all events" policy


-- =====================================================
-- VERIFICATION QUERIES
-- Run these to verify the changes were applied
-- =====================================================

-- Check events table columns
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'events'
-- ORDER BY ordinal_position;

-- Check current event statuses
-- SELECT status, COUNT(*) as count
-- FROM events
-- GROUP BY status;

-- Check map center data
-- SELECT id, title, map_center_lat, map_center_lng, map_center_address
-- FROM events
-- WHERE map_center_lat IS NOT NULL;
