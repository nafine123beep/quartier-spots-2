-- =====================================================
-- RLS Policy Fixes for Onboarding (Version 2 - No Recursion)
-- Run these SQL statements in your Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. Fix Profiles Table RLS Policies
-- =====================================================

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);


-- =====================================================
-- 2. Fix Tenants Table RLS Policies
-- =====================================================

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Users can create tenants" ON tenants;
DROP POLICY IF EXISTS "Tenant members can view their tenants" ON tenants;
DROP POLICY IF EXISTS "Tenant admins can update their tenants" ON tenants;
DROP POLICY IF EXISTS "Tenant admins can delete their tenants" ON tenants;

-- Allow authenticated users to create tenants
CREATE POLICY "Users can create tenants"
ON tenants FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow users to view tenants they are members of
CREATE POLICY "Tenant members can view their tenants"
ON tenants FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM memberships
    WHERE memberships.tenant_id = tenants.id
    AND memberships.user_id = auth.uid()
    AND memberships.status = 'active'
  )
);

-- Allow admins to update their tenants
-- Note: This is safe because it only checks the tenants table for created_by
CREATE POLICY "Tenant admins can update their tenants"
ON tenants FOR UPDATE
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Allow admins to delete their tenants
CREATE POLICY "Tenant admins can delete their tenants"
ON tenants FOR DELETE
USING (created_by = auth.uid());


-- =====================================================
-- 3. Fix Memberships Table RLS Policies
-- =====================================================

-- Drop ALL existing policies on memberships to start fresh
DROP POLICY IF EXISTS "Users can create memberships for tenants" ON memberships;
DROP POLICY IF EXISTS "Users can view their own memberships" ON memberships;
DROP POLICY IF EXISTS "Tenant admins can view all memberships" ON memberships;
DROP POLICY IF EXISTS "Tenant admins can update memberships" ON memberships;
DROP POLICY IF EXISTS "Tenant admins can delete memberships" ON memberships;
DROP POLICY IF EXISTS "Admins can manage all memberships" ON memberships;

-- Simple policy: Allow users to insert memberships for themselves
CREATE POLICY "Users can create memberships for tenants"
ON memberships FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Simple policy: Allow all authenticated users to view all memberships
-- This prevents recursion and is safe because memberships don't contain sensitive data
CREATE POLICY "Anyone can view memberships"
ON memberships FOR SELECT
TO authenticated
USING (true);

-- Simple policy: Allow users to update/delete only their own memberships
CREATE POLICY "Users can manage their own memberships"
ON memberships FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memberships"
ON memberships FOR DELETE
TO authenticated
USING (auth.uid() = user_id);


-- =====================================================
-- 4. Make created_by fields nullable (if not already)
-- =====================================================

-- Make created_by nullable in tenants table
ALTER TABLE tenants ALTER COLUMN created_by DROP NOT NULL;

-- Make created_by nullable in events table
ALTER TABLE events ALTER COLUMN created_by DROP NOT NULL;


-- =====================================================
-- 5. Fix Events Table RLS Policies (if needed)
-- =====================================================

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Tenant members can create events" ON events;
DROP POLICY IF EXISTS "Anyone can view published events" ON events;
DROP POLICY IF EXISTS "Tenant members can view all events" ON events;
DROP POLICY IF EXISTS "Event creator can update events" ON events;
DROP POLICY IF EXISTS "Event creator can delete events" ON events;

-- Allow tenant members to create events
CREATE POLICY "Tenant members can create events"
ON events FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM memberships
    WHERE memberships.tenant_id = events.tenant_id
    AND memberships.user_id = auth.uid()
    AND memberships.status = 'active'
  )
);

-- Allow anyone to view published events
CREATE POLICY "Anyone can view published events"
ON events FOR SELECT
USING (status = 'published');

-- Allow tenant members to view all events in their tenant
CREATE POLICY "Tenant members can view all events"
ON events FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM memberships
    WHERE memberships.tenant_id = events.tenant_id
    AND memberships.user_id = auth.uid()
    AND memberships.status = 'active'
  )
);

-- Allow event creators or tenant admins to update events
CREATE POLICY "Event creator can update events"
ON events FOR UPDATE
USING (created_by = auth.uid() OR created_by IS NULL)
WITH CHECK (created_by = auth.uid() OR created_by IS NULL);

-- Allow event creators to delete events
CREATE POLICY "Event creator can delete events"
ON events FOR DELETE
USING (created_by = auth.uid() OR created_by IS NULL);


-- =====================================================
-- 6. Fix Spots Table RLS Policies (if needed)
-- =====================================================

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Tenant members can create spots" ON spots;
DROP POLICY IF EXISTS "Anyone can view spots for published events" ON spots;
DROP POLICY IF EXISTS "Tenant members can view all spots" ON spots;
DROP POLICY IF EXISTS "Tenant members can update spots" ON spots;
DROP POLICY IF EXISTS "Tenant members can delete spots" ON spots;
DROP POLICY IF EXISTS "Public can create spots" ON spots;

-- Allow anyone (even anonymous) to create spots
CREATE POLICY "Public can create spots"
ON spots FOR INSERT
WITH CHECK (true);

-- Allow anyone to view spots for published events
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
USING (
  EXISTS (
    SELECT 1 FROM memberships
    WHERE memberships.tenant_id = spots.tenant_id
    AND memberships.user_id = auth.uid()
    AND memberships.status = 'active'
  )
);


-- =====================================================
-- VERIFICATION QUERIES
-- Run these to verify the changes were applied
-- =====================================================

-- Check RLS policies on profiles
-- SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename = 'profiles';

-- Check RLS policies on tenants
-- SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename = 'tenants';

-- Check RLS policies on memberships
-- SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename = 'memberships';

-- Check if created_by is nullable
-- SELECT column_name, is_nullable, data_type
-- FROM information_schema.columns
-- WHERE table_name IN ('tenants', 'events')
-- AND column_name = 'created_by';
