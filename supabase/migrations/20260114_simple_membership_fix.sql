-- Simplest fix: Remove the recursive check entirely
-- Users can only view their OWN memberships

DROP POLICY IF EXISTS "Users can view memberships for their tenants" ON memberships;
DROP POLICY IF EXISTS "Users can view own and tenant memberships" ON memberships;
DROP POLICY IF EXISTS "Anonymous cannot view memberships" ON memberships;

-- Users can only see memberships where they are the user
CREATE POLICY "Users can view own memberships"
  ON memberships FOR SELECT  
  TO authenticated
  USING (user_id = auth.uid());

-- Prevent anonymous access to memberships
CREATE POLICY "Block anonymous membership access"
  ON memberships FOR SELECT
  TO anon
  USING (false);
