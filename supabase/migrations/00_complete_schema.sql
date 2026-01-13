-- Complete Database Schema for Quartier-Spots Test Project
-- Run this in your Supabase test project SQL Editor

-- ============================================================================
-- STEP 1: CREATE ENUMS
-- ============================================================================

CREATE TYPE app_role AS ENUM ('admin', 'member');
CREATE TYPE membership_status AS ENUM ('active', 'pending', 'invited');
CREATE TYPE event_status AS ENUM ('draft', 'published', 'archived');

-- ============================================================================
-- STEP 2: CREATE TABLES
-- ============================================================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  consent_version TEXT,
  consent_at TIMESTAMPTZ,
  notification_preferences JSONB DEFAULT '{"contact_form_emails": true}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tenants (Organizations)
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  join_password TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Memberships (User-Tenant relationships)
CREATE TABLE IF NOT EXISTS memberships (
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'member',
  status membership_status NOT NULL DEFAULT 'active',
  invited_email TEXT,
  invite_token TEXT,
  invite_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, user_id)
);

-- Events
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  status event_status NOT NULL DEFAULT 'draft',
  map_center_lat DOUBLE PRECISION,
  map_center_lng DOUBLE PRECISION,
  map_center_address TEXT,
  boundary_radius_meters INTEGER,
  preview_token UUID,
  spot_term_singular TEXT DEFAULT 'Spot',
  spot_term_plural TEXT DEFAULT 'Spots',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, slug)
);

-- Event Images
CREATE TABLE IF NOT EXISTS event_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  filename TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  is_cover BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spots (Registrations)
CREATE TABLE IF NOT EXISTS spots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title TEXT,
  public_note TEXT,
  internal_note TEXT,
  street TEXT,
  house_number TEXT,
  zip TEXT,
  city TEXT,
  address_raw TEXT,
  address_public BOOLEAN NOT NULL DEFAULT false,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  geo_precision TEXT CHECK (geo_precision IN ('exact', 'street', 'city')),
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Spot Deletion Requests
CREATE TABLE IF NOT EXISTS spot_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id UUID NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requester_reason TEXT,
  requester_name TEXT,
  requester_email TEXT,
  requester_address TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  reviewer_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Geocoding Requests (for analytics/debugging)
CREATE TABLE IF NOT EXISTS geocoding_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  spot_id UUID REFERENCES spots(id) ON DELETE SET NULL,
  provider TEXT NOT NULL,
  query_text TEXT,
  result_lat DOUBLE PRECISION,
  result_lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- Contact Messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  honeypot_triggered BOOLEAN DEFAULT false,
  ip_address TEXT,
  user_agent TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'rate_limited', 'spam_detected')),
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  recipient_emails TEXT[],
  recipient_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact Rate Limits
CREATE TABLE IF NOT EXISTS contact_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier_type TEXT NOT NULL CHECK (identifier_type IN ('email', 'ip')),
  identifier_value TEXT NOT NULL,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  attempt_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(identifier_type, identifier_value, tenant_id)
);

-- Consents
CREATE TABLE IF NOT EXISTS consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  subject_type TEXT NOT NULL,
  subject_id UUID NOT NULL,
  consent_type TEXT NOT NULL,
  consent_version TEXT NOT NULL,
  granted BOOLEAN NOT NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  granted_by UUID REFERENCES profiles(id)
);

-- ============================================================================
-- STEP 3: CREATE INDEXES
-- ============================================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_tenant_id ON memberships(tenant_id);
CREATE INDEX IF NOT EXISTS idx_events_tenant_id ON events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_spots_event_id ON spots(event_id);
CREATE INDEX IF NOT EXISTS idx_spots_tenant_id ON spots(tenant_id);
CREATE INDEX IF NOT EXISTS idx_event_images_event_id ON event_images(event_id);
CREATE INDEX IF NOT EXISTS idx_spot_deletion_requests_spot_id ON spot_deletion_requests(spot_id);
CREATE INDEX IF NOT EXISTS idx_spot_deletion_requests_status ON spot_deletion_requests(status);

-- ============================================================================
-- STEP 4: CREATE STORAGE BUCKET (Run in SQL Editor)
-- ============================================================================

-- Create storage bucket for event images
-- Note: This may need to be done via Storage UI if SQL fails
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('event-images', 'event-images', true)
-- ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 5: ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE spot_deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE geocoding_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 6: CREATE RLS POLICIES
-- ============================================================================

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Tenants policies
CREATE POLICY "Users can view tenants they are members of"
  ON tenants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.tenant_id = tenants.id
      AND memberships.user_id = auth.uid()
      AND memberships.status = 'active'
    )
  );

CREATE POLICY "Authenticated users can create tenants"
  ON tenants FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Memberships policies
CREATE POLICY "Users can view memberships for their tenants"
  ON memberships FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Events policies
CREATE POLICY "Members can view all events in their tenants"
  ON events FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
    OR status = 'published'
  );

CREATE POLICY "Members can create events in their tenants"
  ON events FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Spots policies (public read for published events)
CREATE POLICY "Anyone can view spots for published events"
  ON spots FOR SELECT
  USING (
    event_id IN (
      SELECT id FROM events WHERE status = 'published'
    )
    OR tenant_id IN (
      SELECT tenant_id FROM memberships
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Anyone can create spots"
  ON spots FOR INSERT
  WITH CHECK (true);

-- Event images policies
CREATE POLICY "Anyone can view event images"
  ON event_images FOR SELECT
  USING (true);

-- ============================================================================
-- STEP 7: CREATE FUNCTIONS
-- ============================================================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NOW(), NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- NOTES FOR SETUP
-- ============================================================================

-- After running this SQL:
-- 1. Go to Storage → Create bucket: 'event-images' (public)
-- 2. Run the storage policies from: supabase/migrations/20260103203613_storage_policies.sql
-- 3. Create test users in Authentication → Users
-- 4. Test by creating a tenant and event
