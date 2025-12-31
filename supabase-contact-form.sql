-- =====================================================
-- Contact Form Feature - Database Migration
-- =====================================================

-- =====================================================
-- 1. Contact Messages Table (Audit Trail)
-- =====================================================

CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Context (where the message was sent from)
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,

  -- Sender information
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,

  -- Spam protection metadata
  honeypot_triggered BOOLEAN DEFAULT FALSE,
  ip_address TEXT,
  user_agent TEXT,

  -- Delivery status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'rate_limited', 'spam_detected')),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,

  -- Recipients (denormalized for audit trail)
  recipient_emails TEXT[],
  recipient_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_contact_messages_tenant_id ON contact_messages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_event_id ON contact_messages(event_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_messages_sender_email ON contact_messages(sender_email);
CREATE INDEX IF NOT EXISTS idx_contact_messages_ip_address ON contact_messages(ip_address);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_contact_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_contact_messages_timestamp ON contact_messages;
CREATE TRIGGER update_contact_messages_timestamp
  BEFORE UPDATE ON contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_messages_updated_at();

-- RLS Policies
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can create contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Tenant members can view contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Service role can update contact messages" ON contact_messages;

-- Anyone can create contact messages (public form)
CREATE POLICY "Anyone can create contact messages"
ON contact_messages FOR INSERT
TO anon, authenticated
WITH CHECK (status = 'pending');

-- Tenant members can view messages for their tenant
CREATE POLICY "Tenant members can view contact messages"
ON contact_messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM memberships
    WHERE memberships.tenant_id = contact_messages.tenant_id
    AND memberships.user_id = auth.uid()
    AND memberships.status = 'active'
  )
);

-- =====================================================
-- 2. Rate Limiting Table
-- =====================================================

CREATE TABLE IF NOT EXISTS contact_rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Rate limit key (email or IP)
  identifier_type TEXT NOT NULL CHECK (identifier_type IN ('email', 'ip')),
  identifier_value TEXT NOT NULL,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Attempt tracking
  attempt_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Unique constraint per identifier and tenant
  UNIQUE(identifier_type, identifier_value, tenant_id)
);

-- Index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_contact_rate_limits_window_start ON contact_rate_limits(window_start);
CREATE INDEX IF NOT EXISTS idx_contact_rate_limits_tenant_id ON contact_rate_limits(tenant_id);

-- RLS - Allow anonymous inserts and updates for rate limiting
ALTER TABLE contact_rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can manage rate limits" ON contact_rate_limits;

CREATE POLICY "Anyone can manage rate limits"
ON contact_rate_limits FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- =====================================================
-- 3. Add notification_preferences to profiles
-- =====================================================

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"contact_form_emails": true}'::jsonb;

-- Create index for querying by notification preference
CREATE INDEX IF NOT EXISTS idx_profiles_notification_preferences
ON profiles USING gin(notification_preferences);

COMMENT ON COLUMN profiles.notification_preferences IS
'JSON object containing notification preferences. Keys: contact_form_emails (boolean)';

-- =====================================================
-- Cleanup function for old rate limit entries (optional)
-- Run periodically to clean up entries older than 24 hours
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM contact_rate_limits
  WHERE window_start < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;
