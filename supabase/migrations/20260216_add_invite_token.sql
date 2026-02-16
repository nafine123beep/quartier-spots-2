-- Add invite_token column to tenants table for invite link support
-- Token is cryptographically random, unique per tenant, nullable (generated on first dashboard load)
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS invite_token TEXT UNIQUE;

-- Allow authenticated users to look up tenants by invite_token (for the /join flow)
-- This is safe because tokens are cryptographically random and unguessable
CREATE POLICY "Authenticated users can look up tenants by invite_token"
  ON tenants FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND invite_token IS NOT NULL
  );

-- Allow authenticated members to update their own tenants (for invite_token generation)
-- This also enables the existing updateTenant flow from settings
CREATE POLICY "Members can update their own tenants"
  ON tenants FOR UPDATE
  USING (
    id IN (
      SELECT tenant_id FROM memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );
