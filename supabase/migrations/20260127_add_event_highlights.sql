-- Migration: Add Event Highlights Feature
-- Date: 2026-01-27
-- Description: Adds support for event highlights (specialized spots for infrastructure/organization points)

-- Step 1: Add columns to spots table
ALTER TABLE spots
  ADD COLUMN IF NOT EXISTS is_highlight BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS highlight_type TEXT,
  ADD COLUMN IF NOT EXISTS highlight_icon TEXT;

-- Step 2: Create custom highlight types table
CREATE TABLE IF NOT EXISTS event_custom_highlight_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  type_key TEXT NOT NULL,
  label TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, type_key)
);

-- Step 3: Add constraint ensuring highlights have required fields
ALTER TABLE spots
  ADD CONSTRAINT check_highlight_fields
  CHECK (
    (is_highlight = false) OR
    (is_highlight = true AND highlight_type IS NOT NULL AND highlight_icon IS NOT NULL)
  );

-- Step 4: RLS Policies for highlights in spots table
-- Only admins can create highlights
CREATE POLICY "Only admins can create highlights" ON spots
  FOR INSERT
  WITH CHECK (
    NOT is_highlight OR
    created_by IN (
      SELECT user_id FROM memberships
      WHERE tenant_id = spots.tenant_id
        AND role = 'admin'
        AND status = 'active'
    )
  );

-- Only admins can update highlights
CREATE POLICY "Only admins can update highlights" ON spots
  FOR UPDATE
  USING (
    NOT is_highlight OR
    created_by IN (
      SELECT user_id FROM memberships
      WHERE tenant_id = spots.tenant_id
        AND role = 'admin'
        AND status = 'active'
    )
  );

-- Only admins can delete highlights
CREATE POLICY "Only admins can delete highlights" ON spots
  FOR DELETE
  USING (
    NOT is_highlight OR
    created_by IN (
      SELECT user_id FROM memberships
      WHERE tenant_id = spots.tenant_id
        AND role = 'admin'
        AND status = 'active'
    )
  );

-- Step 5: RLS Policies for custom highlight types table
-- Anyone can view custom types for published events or events in their tenant
CREATE POLICY "Anyone can view custom types for published events"
  ON event_custom_highlight_types FOR SELECT
  USING (
    event_id IN (SELECT id FROM events WHERE status = 'published')
    OR event_id IN (
      SELECT id FROM events
      WHERE tenant_id IN (
        SELECT tenant_id FROM memberships
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

-- Only admins can manage custom types (INSERT, UPDATE, DELETE)
CREATE POLICY "Only admins can manage custom types"
  ON event_custom_highlight_types FOR ALL
  USING (
    event_id IN (
      SELECT e.id FROM events e
      JOIN memberships m ON m.tenant_id = e.tenant_id
      WHERE m.user_id = auth.uid()
        AND m.role = 'admin'
        AND m.status = 'active'
    )
  );

-- Step 6: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_spots_is_highlight ON spots(is_highlight);
CREATE INDEX IF NOT EXISTS idx_spots_highlight_type ON spots(highlight_type) WHERE is_highlight = true;
CREATE INDEX IF NOT EXISTS idx_custom_highlight_types_event ON event_custom_highlight_types(event_id);

-- Step 7: Add comment documentation
COMMENT ON TABLE event_custom_highlight_types IS 'Stores event-specific custom highlight types that extend the base 8 predefined types';
COMMENT ON COLUMN spots.is_highlight IS 'Indicates if this spot is a highlight (infrastructure point) vs regular spot (participant registration)';
COMMENT ON COLUMN spots.highlight_type IS 'Type key for highlight (e.g., registration, toilets, food_drinks). Required if is_highlight=true';
COMMENT ON COLUMN spots.highlight_icon IS 'Emoji icon for highlight. Required if is_highlight=true';
