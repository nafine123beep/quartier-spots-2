-- Allow public access to tenant information for published events
-- This is needed so that public users can view event pages without authentication

CREATE POLICY "Anyone can view tenant info for published events"
  ON tenants FOR SELECT
  TO anon, authenticated
  USING (
    -- Allow access to any tenant that has at least one published event
    EXISTS (
      SELECT 1 FROM events
      WHERE events.tenant_id = tenants.id
      AND events.status = 'published'
    )
  );
