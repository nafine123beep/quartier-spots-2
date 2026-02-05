-- Migration: Remove Draft Status and Preview Token
-- Simplify event lifecycle to: active (public) and archived
-- Run this BEFORE deploying frontend changes

-- =====================================================
-- STEP 1: Drop all dependent RLS policies
-- =====================================================

-- Drop policies on events table
DROP POLICY IF EXISTS "Members can view all events in their tenants" ON events;
DROP POLICY IF EXISTS "Anyone can view published events" ON events;
DROP POLICY IF EXISTS "Allow public read for published events or with preview token" ON events;
DROP POLICY IF EXISTS "Anyone can view published events or with preview token" ON events;

-- Drop policies on spots table that depend on events.status
DROP POLICY IF EXISTS "Anyone can view spots for published events" ON spots;

-- Drop policies on tenants table that depend on events.status
DROP POLICY IF EXISTS "Anyone can view tenant info for published events" ON tenants;
DROP POLICY IF EXISTS "Public can view tenants with published events" ON tenants;

-- Drop policies on event_custom_highlight_types table that depend on events.status
DROP POLICY IF EXISTS "Anyone can view custom types for published events" ON event_custom_highlight_types;

-- =====================================================
-- STEP 2: Convert existing events to new status values
-- =====================================================

-- Convert all draft events to published (they will become active)
UPDATE events SET status = 'published' WHERE status = 'draft';

-- =====================================================
-- STEP 3: Drop preview_token column and index
-- =====================================================

DROP INDEX IF EXISTS idx_events_preview_token;
ALTER TABLE events DROP COLUMN IF EXISTS preview_token;

-- =====================================================
-- STEP 4: Migrate status column to new enum
-- =====================================================

-- Create new enum type
CREATE TYPE event_status_new AS ENUM ('active', 'archived');

-- Add temporary column with new type
ALTER TABLE events ADD COLUMN status_new event_status_new;

-- Migrate data to new column
UPDATE events SET status_new =
  CASE
    WHEN status = 'archived' THEN 'archived'::event_status_new
    ELSE 'active'::event_status_new
  END;

-- Set NOT NULL constraint on new column
ALTER TABLE events ALTER COLUMN status_new SET NOT NULL;

-- Set default for new column
ALTER TABLE events ALTER COLUMN status_new SET DEFAULT 'active'::event_status_new;

-- Drop old column and rename new one
ALTER TABLE events DROP COLUMN status;
ALTER TABLE events RENAME COLUMN status_new TO status;

-- Drop old enum type
DROP TYPE event_status;

-- Rename new enum to original name
ALTER TYPE event_status_new RENAME TO event_status;

-- =====================================================
-- STEP 5: Recreate RLS policies with 'active' status
-- =====================================================

-- Policies on events table
CREATE POLICY "Anyone can view active events"
  ON events FOR SELECT
  USING (status = 'active');

CREATE POLICY "Members can view all events in their tenants"
  ON events FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Policy on spots table (changed from 'published' to 'active')
CREATE POLICY "Anyone can view spots for active events"
  ON spots FOR SELECT
  USING (
    event_id IN (
      SELECT id FROM events WHERE status = 'active'
    )
  );

-- Policy on tenants table (changed from 'published' to 'active')
CREATE POLICY "Anyone can view tenant info for active events"
  ON tenants FOR SELECT
  USING (
    id IN (
      SELECT tenant_id FROM events WHERE status = 'active'
    )
  );

-- Policy on event_custom_highlight_types table (changed from 'published' to 'active')
CREATE POLICY "Anyone can view custom types for active events"
  ON event_custom_highlight_types FOR SELECT
  USING (
    event_id IN (
      SELECT id FROM events WHERE status = 'active'
    )
  );

-- =====================================================
-- Verify migration
-- =====================================================
-- SELECT status, COUNT(*) FROM events GROUP BY status;
