export interface Spot {
  id: string;
  tenant_id: string;
  event_id: string;
  title?: string;
  public_note?: string;
  internal_note?: string;
  street?: string;
  house_number?: string;
  zip?: string;
  city?: string;
  address_raw?: string;
  address_public: boolean;
  lat?: number;
  lng?: number;
  geo_precision: 'exact' | 'street' | 'city';
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Event Highlights fields
  is_highlight: boolean;
  highlight_type?: string | null;
  highlight_icon?: string | null;
}

export interface FlohmarktEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  link: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  created_by: string;
  created_at: string;
  join_password?: string; // only visible to admins
  invite_token?: string; // only visible to admins
}

export interface Member {
  user_id: string;
  tenant_id: string;
  role: 'admin' | 'member';
  status: 'active' | 'pending' | 'invited';
  email?: string;
  display_name?: string;
  created_at: string;
}

export interface EventImage {
  id: string;
  event_id: string;
  storage_path: string;
  filename: string;
  position: number;
  is_cover: boolean;
  created_at: string;
}

export interface TenantEvent {
  id: string;
  tenant_id: string;
  title: string;
  slug: string;
  description?: string;
  starts_at?: string;
  ends_at?: string;
  status: 'active' | 'archived';
  map_center_lat?: number;
  map_center_lng?: number;
  map_center_address?: string;
  boundary_radius_meters?: number | null;
  spot_term_singular?: string;
  spot_term_plural?: string;
  created_by?: string;
  created_at: string;
  updated_at?: string;
  images?: EventImage[];
}

export interface SpotDeletionRequest {
  id: string;
  spot_id: string;
  tenant_id: string;
  event_id: string;
  status: 'pending' | 'approved' | 'rejected';
  requester_reason?: string;
  requester_name?: string;
  requester_email?: string;
  requester_address?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  reviewer_note?: string;
  created_at: string;
  updated_at: string;
}

export interface ContactMessage {
  id: string;
  tenant_id: string;
  event_id?: string;
  sender_name: string;
  sender_email: string;
  subject: string;
  message: string;
  status: 'pending' | 'sent' | 'failed' | 'rate_limited' | 'spam_detected';
  recipient_count: number;
  created_at: string;
}

export interface LocationCache {
  consentGiven: boolean;
  consentTimestamp: string;
  consentVersion: string;
  address?: {
    street: string;
    houseNumber: string;
    zip: string;
    city: string;
    addressRaw: string;
  };
  coordinates?: {
    lat: number;
    lng: number;
    geoPrecision: 'exact' | 'street' | 'city';
  };
  lastUsed: string;
  createdAt: string;
}

export interface NotificationPreferences {
  contact_form_emails: boolean;
}

export type ViewType = 'frontpage' | 'tenantDashboard' | 'eventOverview' | 'eventDetail' | 'settings' | 'app';
export type AppTabType = 'list' | 'map' | 'form' | 'delete';

// Event Highlights interfaces
export interface CustomHighlightType {
  id: string;
  event_id: string;
  type_key: string;
  label: string;
  icon: string;
  created_by?: string;
  created_at: string;
}

export interface HighlightTypeDefinition {
  key: string;
  label: string;
  icon: string;
}
