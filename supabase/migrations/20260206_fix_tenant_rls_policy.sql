-- Fix: Add missing RLS policy for tenants
-- Members must be able to see tenants they belong to,
-- regardless of whether those tenants have active events.
--
-- Without this policy, loadTenants() fails because the join
-- from memberships → tenants is blocked by RLS.

-- Allow members to see their own tenants
CREATE POLICY "Members can view their own tenants"
  ON tenants FOR SELECT
  USING (
    id IN (
      SELECT tenant_id FROM memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );
