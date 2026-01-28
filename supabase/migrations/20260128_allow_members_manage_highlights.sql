-- Migration: Allow members (not just admins) to manage highlights
-- This updates RLS policies to allow both admin and member roles to manage highlight spots

-- Drop existing admin-only policies
DROP POLICY IF EXISTS "Only admins can create highlights" ON spots;
DROP POLICY IF EXISTS "Only admins can update highlights" ON spots;
DROP POLICY IF EXISTS "Only admins can delete highlights" ON spots;
DROP POLICY IF EXISTS "Only admins can manage custom types" ON event_custom_highlight_types;

-- Create new policies allowing both admins and members
CREATE POLICY "Members can create highlights" ON spots
  FOR INSERT
  WITH CHECK (
    NOT is_highlight OR
    created_by IN (
      SELECT user_id FROM memberships
      WHERE tenant_id = spots.tenant_id
        AND role IN ('admin', 'member')
        AND status = 'active'
    )
  );

CREATE POLICY "Members can update highlights" ON spots
  FOR UPDATE
  USING (
    NOT is_highlight OR
    created_by IN (
      SELECT user_id FROM memberships
      WHERE tenant_id = spots.tenant_id
        AND role IN ('admin', 'member')
        AND status = 'active'
    )
  );

CREATE POLICY "Members can delete highlights" ON spots
  FOR DELETE
  USING (
    NOT is_highlight OR
    created_by IN (
      SELECT user_id FROM memberships
      WHERE tenant_id = spots.tenant_id
        AND role IN ('admin', 'member')
        AND status = 'active'
    )
  );

CREATE POLICY "Members can manage custom types"
  ON event_custom_highlight_types FOR ALL
  USING (
    event_id IN (
      SELECT e.id FROM events e
      JOIN memberships m ON m.tenant_id = e.tenant_id
      WHERE m.user_id = auth.uid()
        AND m.role IN ('admin', 'member')
        AND m.status = 'active'
    )
  );
