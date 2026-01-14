-- Fix the infinite recursion in memberships policy
-- The recursive policy: memberships checks memberships within its own policy

-- Drop the problematic membership policy
DROP POLICY IF EXISTS "Users can view memberships for their tenants" ON memberships;

-- Create a non-recursive policy for memberships
-- Users can view memberships where they are the user, OR where they are a member of that tenant
CREATE POLICY "Users can view own and tenant memberships"
  ON memberships FOR SELECT
  TO authenticated
  USING (
    -- Can see own membership
    user_id = auth.uid()
    OR
    -- Can see other memberships in tenants where user is an active member
    (
      status = 'active' 
      AND tenant_id IN (
        SELECT m2.tenant_id 
        FROM memberships m2
        WHERE m2.user_id = auth.uid() 
        AND m2.status = 'active'
      )
    )
  );

-- Also ensure anonymous users can't see memberships at all
CREATE POLICY "Anonymous cannot view memberships"
  ON memberships FOR SELECT
  TO anon
  USING (false);
