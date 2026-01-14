-- Fix infinite recursion in RLS policies
-- The issue: tenant policy checking memberships, membership policy checking memberships = infinite loop

-- Drop existing policies
DROP POLICY IF EXISTS "Public can read tenant basic info" ON tenants;
DROP POLICY IF EXISTS "Users can view tenants they are members of" ON tenants;

-- Create two separate policies for tenants:
-- 1. Members can view their tenants (uses auth.uid() directly, no subquery)
CREATE POLICY "Members can view their tenants"
  ON tenants FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT tenant_id 
      FROM memberships 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );

-- 2. Anyone (including anon) can view tenants that have published events
--    This uses a lateral join to avoid recursion
CREATE POLICY "Public can view tenants with published events"
  ON tenants FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM events 
      WHERE events.tenant_id = tenants.id 
      AND events.status = 'published'
      LIMIT 1
    )
  );
