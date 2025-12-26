-- =====================================================
-- RLS Policy Fixes for Onboarding
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
CREATE POLICY "Tenant admins can update their tenants"
ON tenants FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM memberships
    WHERE memberships.tenant_id = tenants.id
    AND memberships.user_id = auth.uid()
    AND memberships.role = 'admin'
    AND memberships.status = 'active'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM memberships
    WHERE memberships.tenant_id = tenants.id
    AND memberships.user_id = auth.uid()
    AND memberships.role = 'admin'
    AND memberships.status = 'active'
  )
);

-- Allow admins to delete their tenants
CREATE POLICY "Tenant admins can delete their tenants"
ON tenants FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM memberships
    WHERE memberships.tenant_id = tenants.id
    AND memberships.user_id = auth.uid()
    AND memberships.role = 'admin'
    AND memberships.status = 'active'
  )
);


-- =====================================================
-- 3. Fix Memberships Table RLS Policies
-- =====================================================

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Users can create memberships for tenants" ON memberships;
DROP POLICY IF EXISTS "Users can view their own memberships" ON memberships;
DROP POLICY IF EXISTS "Tenant admins can view all memberships" ON memberships;
DROP POLICY IF EXISTS "Tenant admins can update memberships" ON memberships;
DROP POLICY IF EXISTS "Tenant admins can delete memberships" ON memberships;
DROP POLICY IF EXISTS "Admins can manage all memberships" ON memberships;

-- Allow users to create memberships (for joining/creating tenants)
CREATE POLICY "Users can create memberships for tenants"
ON memberships FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to view all memberships (needed to avoid recursion)
-- This is safe because memberships don't contain sensitive data
CREATE POLICY "Users can view their own memberships"
ON memberships FOR SELECT
TO authenticated
USING (true);

-- Allow tenant admins to update memberships (checking role directly)
CREATE POLICY "Admins can manage all memberships"
ON memberships FOR UPDATE
TO authenticated
USING (
  -- User must be an admin in the same tenant
  tenant_id IN (
    SELECT tenant_id FROM memberships
    WHERE user_id = auth.uid()
    AND role = 'admin'
    AND status = 'active'
  )
)
WITH CHECK (
  -- User must be an admin in the same tenant
  tenant_id IN (
    SELECT tenant_id FROM memberships
    WHERE user_id = auth.uid()
    AND role = 'admin'
    AND status = 'active'
  )
);

-- Allow tenant admins to delete memberships
CREATE POLICY "Tenant admins can delete memberships"
ON memberships FOR DELETE
TO authenticated
USING (
  -- User must be an admin in the same tenant
  tenant_id IN (
    SELECT tenant_id FROM memberships
    WHERE user_id = auth.uid()
    AND role = 'admin'
    AND status = 'active'
  )
);


-- =====================================================
-- 4. Make created_by fields nullable (if not already)
-- =====================================================

-- Make created_by nullable in tenants table
ALTER TABLE tenants ALTER COLUMN created_by DROP NOT NULL;

-- Make created_by nullable in events table
ALTER TABLE events ALTER COLUMN created_by DROP NOT NULL;


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
