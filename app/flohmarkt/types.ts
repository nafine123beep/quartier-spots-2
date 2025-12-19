export interface Spot {
  id: string;
  address: string;
  description: string;
  lat: number;
  lng: number;
  name: string;
  contact: string;
  consent: boolean;
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

export interface TenantEvent {
  id: string;
  tenant_id: string;
  title: string;
  description?: string;
  starts_at?: string;
  ends_at?: string;
  status: 'draft' | 'active' | 'archived';
  created_by?: string;
  created_at: string;
}

export type ViewType = 'frontpage' | 'tenantDashboard' | 'eventOverview' | 'eventDetail' | 'settings' | 'app';
export type AppTabType = 'list' | 'map' | 'form' | 'delete';
