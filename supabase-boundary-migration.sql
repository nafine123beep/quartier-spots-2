-- Migration: Add boundary_radius_meters column to events table
-- This allows event creators to optionally restrict spot creation to a specific radius from the map center

-- Add the boundary radius column (nullable for backwards compatibility)
ALTER TABLE events ADD COLUMN IF NOT EXISTS boundary_radius_meters INTEGER NULL;

-- Add comment for documentation
COMMENT ON COLUMN events.boundary_radius_meters IS 'Optional radius in meters from map_center for spot validation. NULL means no boundary restriction.';
