-- =====================================================
-- Supabase Migrations for Flohmarkt App
-- Run these SQL statements in your Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. Add slug column to events table
-- =====================================================
ALTER TABLE events ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create unique index for slug within tenant (event slugs must be unique per tenant)
CREATE UNIQUE INDEX IF NOT EXISTS events_tenant_slug_unique
ON events (tenant_id, slug);

-- Generate slugs for existing events that don't have one
UPDATE events
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(title, '[^a-zA-Z0-9]+', '-', 'g'), '(^-|-$)', '', 'g'))
WHERE slug IS NULL;

-- Make slug NOT NULL after populating existing records
ALTER TABLE events ALTER COLUMN slug SET NOT NULL;


-- =====================================================
-- 2. Add join_password column to tenants table
-- =====================================================
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS join_password TEXT;

-- Generate random passwords for existing tenants that don't have one
UPDATE tenants
SET join_password = SUBSTR(MD5(RANDOM()::TEXT), 1, 8)
WHERE join_password IS NULL;


-- =====================================================
-- 3. Row Level Security (RLS) Policies for spots table
-- (Ensure public can insert spots for active events)
-- =====================================================

-- Enable RLS on spots table if not already enabled
ALTER TABLE spots ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read spots for active events
CREATE POLICY IF NOT EXISTS "Anyone can view spots for active events"
ON spots FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = spots.event_id
    AND events.status = 'active'
  )
);

-- Allow anyone to insert spots for active events
CREATE POLICY IF NOT EXISTS "Anyone can create spots for active events"
ON spots FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = event_id
    AND events.status = 'active'
  )
);

-- Allow tenant members to manage all spots for their tenant's events
CREATE POLICY IF NOT EXISTS "Tenant members can manage spots"
ON spots FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM memberships
    WHERE memberships.tenant_id = spots.tenant_id
    AND memberships.user_id = auth.uid()
    AND memberships.status = 'active'
  )
);


-- =====================================================
-- 4. Row Level Security for events table
-- =====================================================

-- Enable RLS on events table if not already enabled
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read active events
CREATE POLICY IF NOT EXISTS "Anyone can view active events"
ON events FOR SELECT
USING (status = 'active');

-- Allow tenant members to view all their tenant's events
CREATE POLICY IF NOT EXISTS "Tenant members can view all events"
ON events FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM memberships
    WHERE memberships.tenant_id = events.tenant_id
    AND memberships.user_id = auth.uid()
    AND memberships.status = 'active'
  )
);

-- Allow tenant members to manage their tenant's events
CREATE POLICY IF NOT EXISTS "Tenant members can manage events"
ON events FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM memberships
    WHERE memberships.tenant_id = events.tenant_id
    AND memberships.user_id = auth.uid()
    AND memberships.status = 'active'
  )
);


-- =====================================================
-- VERIFICATION QUERIES
-- Run these to verify the changes were applied
-- =====================================================

-- Check events table columns
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'events'
-- ORDER BY ordinal_position;

-- Check tenants table columns
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'tenants'
-- ORDER BY ordinal_position;
