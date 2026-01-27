-- Rollback Migration: Remove Event Highlights Feature
-- Date: 2026-01-27
-- Description: Rollback script to remove event highlights feature if needed

-- Step 1: Drop indexes (reverse order from creation)
DROP INDEX IF EXISTS idx_custom_highlight_types_event;
DROP INDEX IF EXISTS idx_spots_highlight_type;
DROP INDEX IF EXISTS idx_spots_is_highlight;

-- Step 2: Drop RLS policies for custom highlight types
DROP POLICY IF EXISTS "Only admins can manage custom types" ON event_custom_highlight_types;
DROP POLICY IF EXISTS "Anyone can view custom types for published events" ON event_custom_highlight_types;

-- Step 3: Drop RLS policies for highlights in spots table
DROP POLICY IF EXISTS "Only admins can delete highlights" ON spots;
DROP POLICY IF EXISTS "Only admins can update highlights" ON spots;
DROP POLICY IF EXISTS "Only admins can create highlights" ON spots;

-- Step 4: Drop custom highlight types table
DROP TABLE IF EXISTS event_custom_highlight_types;

-- Step 5: Drop constraint from spots table
ALTER TABLE spots DROP CONSTRAINT IF EXISTS check_highlight_fields;

-- Step 6: Drop columns from spots table
ALTER TABLE spots DROP COLUMN IF EXISTS highlight_icon;
ALTER TABLE spots DROP COLUMN IF EXISTS highlight_type;
ALTER TABLE spots DROP COLUMN IF EXISTS is_highlight;

-- Note: Any existing highlight data will be permanently deleted when running this rollback
