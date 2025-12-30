-- =====================================================
-- Spot Deletion Requests Table
-- Purpose: Track deletion requests from public users
--          and allow organizers to approve/reject them
-- =====================================================

CREATE TABLE IF NOT EXISTS spot_deletion_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Foreign keys
  spot_id UUID NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,

  -- Request metadata
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requester_reason TEXT, -- Optional reason from requester

  -- Requester info (denormalized for audit trail even after spot deletion)
  requester_name TEXT,
  requester_email TEXT,
  requester_address TEXT, -- address_raw from spot at time of request

  -- Review metadata
  reviewed_by UUID REFERENCES profiles(id), -- organizer who processed the request
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewer_note TEXT, -- Optional rejection reason or note

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

-- Partial unique index: Only one pending request per spot at a time
CREATE UNIQUE INDEX unique_pending_request_per_spot
ON spot_deletion_requests(spot_id)
WHERE status = 'pending';

CREATE INDEX idx_spot_deletion_requests_event_id ON spot_deletion_requests(event_id);
CREATE INDEX idx_spot_deletion_requests_tenant_id ON spot_deletion_requests(tenant_id);
CREATE INDEX idx_spot_deletion_requests_status ON spot_deletion_requests(status);
CREATE INDEX idx_spot_deletion_requests_spot_id ON spot_deletion_requests(spot_id);

-- =====================================================
-- Updated_at Trigger
-- =====================================================

CREATE OR REPLACE FUNCTION update_spot_deletion_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_spot_deletion_requests_timestamp
  BEFORE UPDATE ON spot_deletion_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_spot_deletion_requests_updated_at();

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

ALTER TABLE spot_deletion_requests ENABLE ROW LEVEL SECURITY;

-- Anyone (even anonymous) can create deletion requests
CREATE POLICY "Anyone can create deletion requests"
ON spot_deletion_requests FOR INSERT
WITH CHECK (status = 'pending');

-- Public users can view their own pending requests (by matching requester email)
CREATE POLICY "Users can view their own requests"
ON spot_deletion_requests FOR SELECT
USING (
  requester_email = current_setting('request.jwt.claims', true)::json->>'email'
  OR requester_email IS NULL -- Allow viewing if no email was provided
);

-- Tenant members can view all deletion requests for their tenant
CREATE POLICY "Tenant members can view all requests"
ON spot_deletion_requests FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM memberships
    WHERE memberships.tenant_id = spot_deletion_requests.tenant_id
    AND memberships.user_id = auth.uid()
    AND memberships.status = 'active'
  )
);

-- Tenant members can update deletion requests (approve/reject)
CREATE POLICY "Tenant members can update requests"
ON spot_deletion_requests FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM memberships
    WHERE memberships.tenant_id = spot_deletion_requests.tenant_id
    AND memberships.user_id = auth.uid()
    AND memberships.status = 'active'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM memberships
    WHERE memberships.tenant_id = spot_deletion_requests.tenant_id
    AND memberships.user_id = auth.uid()
    AND memberships.status = 'active'
  )
);

-- Tenant members can delete requests (cleanup)
CREATE POLICY "Tenant members can delete requests"
ON spot_deletion_requests FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM memberships
    WHERE memberships.tenant_id = spot_deletion_requests.tenant_id
    AND memberships.user_id = auth.uid()
    AND memberships.status = 'active'
  )
);

-- =====================================================
-- Comments for Documentation
-- =====================================================

COMMENT ON TABLE spot_deletion_requests IS 'Tracks deletion requests from public users requiring organizer approval';
COMMENT ON COLUMN spot_deletion_requests.status IS 'Request status: pending (awaiting review), approved (spot deleted), rejected (request denied)';
COMMENT ON COLUMN spot_deletion_requests.requester_reason IS 'Optional reason provided by requester for deletion';
COMMENT ON COLUMN spot_deletion_requests.requester_address IS 'Denormalized address for audit trail - preserved even after spot deletion';
COMMENT ON COLUMN spot_deletion_requests.reviewer_note IS 'Optional note from organizer explaining rejection or approval';
COMMENT ON INDEX unique_pending_request_per_spot IS 'Prevents duplicate pending requests for the same spot';
