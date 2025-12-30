-- =====================================================
-- Cleanup and Rebuild Spots Table RLS Policies
-- Purpose: Remove all existing policies and create only the correct ones
-- =====================================================

-- =====================================================
-- 1. Drop ALL existing policies on spots table
-- =====================================================

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'spots') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON spots';
    END LOOP;
END $$;

-- =====================================================
-- 2. Create the correct policies
-- =====================================================

-- Allow anyone (even anonymous) to create spots
-- Note: Using 'public' role includes both anon and authenticated
CREATE POLICY "Public can create spots"
ON spots FOR INSERT
WITH CHECK (true);

-- Allow anyone (including anonymous) to view spots for published events
-- Note: Omitting TO clause defaults to 'public' which includes both anon and authenticated
CREATE POLICY "Anyone can view spots for published events"
ON spots FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = spots.event_id
    AND events.status = 'published'
  )
);

-- Allow tenant members to view all spots in their tenant
CREATE POLICY "Tenant members can view all spots"
ON spots FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM memberships
    WHERE memberships.tenant_id = spots.tenant_id
    AND memberships.user_id = auth.uid()
    AND memberships.status = 'active'
  )
);

-- Allow tenant members to update spots
CREATE POLICY "Tenant members can update spots"
ON spots FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM memberships
    WHERE memberships.tenant_id = spots.tenant_id
    AND memberships.user_id = auth.uid()
    AND memberships.status = 'active'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM memberships
    WHERE memberships.tenant_id = spots.tenant_id
    AND memberships.user_id = auth.uid()
    AND memberships.status = 'active'
  )
);

-- Allow tenant members to delete spots
CREATE POLICY "Tenant members can delete spots"
ON spots FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM memberships
    WHERE memberships.tenant_id = spots.tenant_id
    AND memberships.user_id = auth.uid()
    AND memberships.status = 'active'
  )
);

-- =====================================================
-- 3. Verification Query
-- =====================================================

-- Check how many policies exist on spots table (should be exactly 5)
SELECT COUNT(*) as policy_count, 'Expected: 5 policies' as note
FROM pg_policies
WHERE tablename = 'spots';

-- List all policies on spots table
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'spots'
ORDER BY policyname;
