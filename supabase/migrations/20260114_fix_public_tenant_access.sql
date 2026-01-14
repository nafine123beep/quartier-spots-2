-- Drop the previous policy if it exists
DROP POLICY IF EXISTS "Anyone can view tenant info for published events" ON tenants;

-- Allow public access to tenant basic information
-- This is needed so that public users can view event pages without authentication
-- The check for published events happens at the events table level, not here
CREATE POLICY "Public can read tenant basic info"
  ON tenants FOR SELECT
  TO anon, authenticated
  USING (true);  -- Allow anyone to read tenant info
