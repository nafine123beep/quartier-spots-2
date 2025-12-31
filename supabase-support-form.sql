-- Support Messages Table for "Kontakt & Support" form
CREATE TABLE IF NOT EXISTS support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  honeypot_triggered BOOLEAN DEFAULT FALSE,
  ip_address TEXT,
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can insert support messages
DROP POLICY IF EXISTS "Anyone can insert support messages" ON support_messages;
CREATE POLICY "Anyone can insert support messages"
ON support_messages FOR INSERT
WITH CHECK (true);

-- Support Rate Limits Table (separate from contact rate limits)
CREATE TABLE IF NOT EXISTS support_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier_type TEXT NOT NULL CHECK (identifier_type IN ('email', 'ip')),
  identifier_value TEXT NOT NULL,
  attempt_count INTEGER DEFAULT 0,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(identifier_type, identifier_value)
);

-- Enable RLS
ALTER TABLE support_rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS policies for rate limits
DROP POLICY IF EXISTS "Anyone can read support rate limits" ON support_rate_limits;
CREATE POLICY "Anyone can read support rate limits"
ON support_rate_limits FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Anyone can insert support rate limits" ON support_rate_limits;
CREATE POLICY "Anyone can insert support rate limits"
ON support_rate_limits FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update support rate limits" ON support_rate_limits;
CREATE POLICY "Anyone can update support rate limits"
ON support_rate_limits FOR UPDATE
USING (true)
WITH CHECK (true);
