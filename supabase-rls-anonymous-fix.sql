-- =====================================================
-- Fix RLS Policies to Allow Anonymous Access
-- Purpose: Allow public (non-authenticated) users to view published events and tenant data
-- =====================================================

-- =====================================================
-- 1. Fix Tenants Table - Allow Anonymous Read
-- =====================================================

DROP POLICY IF EXISTS "Public can view tenants" ON tenants;

-- Allow anyone (including anonymous) to view tenant basic info
CREATE POLICY "Public can view tenants"
ON tenants FOR SELECT
TO anon, authenticated
USING (true);


-- =====================================================
-- 2. Fix Events Table - Allow Anonymous Read for Published Events
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view published events" ON events;

-- Allow anyone (including anonymous) to view published events
CREATE POLICY "Anyone can view published events"
ON events FOR SELECT
TO anon, authenticated
USING (status = 'published');


-- =====================================================
-- 3. Fix Spots Table - Allow Anonymous Read for Published Events
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view spots for published events" ON spots;

-- Allow anyone (including anonymous) to view spots for published events
CREATE POLICY "Anyone can view spots for published events"
ON spots FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = spots.event_id
    AND events.status = 'published'
  )
);


-- =====================================================
-- VERIFICATION QUERIES
-- Run these to verify the changes were applied
-- =====================================================

-- Check RLS policies on tenants
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'tenants';

-- Check RLS policies on events
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'events';

-- Check RLS policies on spots
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'spots';
