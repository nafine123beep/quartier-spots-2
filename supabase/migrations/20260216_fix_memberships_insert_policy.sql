-- Fix: Add INSERT policy for memberships table
-- Issue: Users cannot create organizations because they can't insert their own membership
-- Date: 2026-02-16

-- Drop existing policy if it exists (to make migration idempotent)
DROP POLICY IF EXISTS "Users can create their own memberships" ON memberships;

-- Allow authenticated users to create memberships for themselves
-- This is needed when:
-- 1. Creating a new organization (user becomes admin)
-- 2. Joining an existing organization (user becomes member)
CREATE POLICY "Users can create their own memberships"
  ON memberships FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Verification query (run after migration):
-- SELECT * FROM pg_policies WHERE tablename = 'memberships';
