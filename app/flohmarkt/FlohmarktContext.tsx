"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { Spot, FlohmarktEvent, ViewType, AppTabType, User, Tenant, Member, TenantEvent, SpotDeletionRequest } from "./types";
import { generateSlug } from "./utils/slug";


interface FlohmarktContextType {
  // State
  spots: Spot[];
  currentEvent: FlohmarktEvent | null;
  currentView: ViewType;
  currentTab: AppTabType;
  isAuthenticated: boolean;
  user: User | null;
  deletePreFill: string;
  highlightedSpotId: string | null;

  // Tenant state
  tenants: Tenant[];
  currentTenant: Tenant | null;
  tenantEvents: TenantEvent[];
  members: Member[];
  isAdmin: boolean;
  loading: boolean;

  // Actions
  setCurrentView: (view: ViewType) => void;
  setCurrentTab: (tab: AppTabType) => void;
  addSpot: (spot: Omit<Spot, "id">) => Promise<string | null>;
  deleteSpot: (id: string) => void;
  deleteSpotByVerification: (addressRaw: string, contactName: string, contactEmail: string, reason?: string) => Promise<{ success: boolean; error?: string }>;
  createEvent: (title: string, date: string, startTime: string, endTime: string) => void;
  logout: () => void;
  setDeletePreFill: (address: string) => void;
  setHighlightedSpotId: (id: string | null) => void;
  getAllEmails: () => string[];

  // Tenant actions
  loadTenants: () => Promise<void>;
  selectTenant: (tenant: Tenant) => Promise<void>;
  setCurrentTenant: (tenant: Tenant) => void;
  createTenant: (name: string, joinPassword: string) => Promise<{ success: boolean; error?: string }>;
  joinTenant: (tenantId: string, password: string) => Promise<{ success: boolean; error?: string }>;
  searchTenants: (query: string) => Promise<Tenant[]>;
  loadTenantEvents: () => Promise<void>;
  loadMembers: () => Promise<void>;
  createTenantEvent: (title: string, description: string, startsAt: string, endsAt: string, mapCenterAddress: string, mapCenterLat: number, mapCenterLng: number) => Promise<{ success: boolean; error?: string }>;
  removeMember: (userId: string) => Promise<{ success: boolean; error?: string }>;
  updateMemberRole: (userId: string, role: 'admin' | 'member') => Promise<{ success: boolean; error?: string }>;
  setCurrentTenantEvent: (event: TenantEvent) => void;
  currentTenantEvent: TenantEvent | null;

  // Profile & Tenant update actions
  updateUserProfile: (name: string, email?: string) => Promise<{ success: boolean; error?: string; emailChanged?: boolean }>;
  updateTenant: (name: string, password: string) => Promise<{ success: boolean; error?: string }>;
  deleteTenant: (password: string) => Promise<{ success: boolean; error?: string }>;

  // Tenant lookup
  findTenantBySlug: (slug: string) => Tenant | undefined;
  findEventBySlug: (slug: string) => TenantEvent | undefined;
  findEventBySlugOrId: (slugOrId: string) => TenantEvent | undefined;

  // Event management
  updateEvent: (eventId: string, data: Partial<TenantEvent>) => Promise<{ success: boolean; error?: string }>;
  publishEvent: (eventId: string) => Promise<{ success: boolean; error?: string }>;
  archiveEvent: (eventId: string) => Promise<{ success: boolean; error?: string }>;
  deleteEvent: (eventId: string) => Promise<{ success: boolean; error?: string }>;

  // Deletion request state
  deletionRequests: SpotDeletionRequest[];
  pendingDeletionCount: number;

  // Deletion request actions
  requestSpotDeletion: (
    spotId: string,
    requesterName: string,
    requesterEmail: string,
    requesterAddress: string,
    reason?: string
  ) => Promise<{ success: boolean; error?: string }>;
  loadDeletionRequests: () => Promise<void>;
  approveDeletionRequest: (requestId: string) => Promise<{ success: boolean; error?: string }>;
  rejectDeletionRequest: (requestId: string, reviewerNote: string) => Promise<{ success: boolean; error?: string }>;
}

const FlohmarktContext = createContext<FlohmarktContextType | null>(null);

export function FlohmarktProvider({ children }: { children: ReactNode }) {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [currentEvent, setCurrentEvent] = useState<FlohmarktEvent | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>("frontpage");
  const [currentTab, setCurrentTab] = useState<AppTabType>("list");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [deletePreFill, setDeletePreFill] = useState("");
  const [highlightedSpotId, setHighlightedSpotId] = useState<string | null>(null);

  // Tenant state
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [tenantEvents, setTenantEvents] = useState<TenantEvent[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentTenantEvent, setCurrentTenantEvent] = useState<TenantEvent | null>(null);

  // Deletion request state
  const [deletionRequests, setDeletionRequests] = useState<SpotDeletionRequest[]>([]);
  const [pendingDeletionCount, setPendingDeletionCount] = useState(0);

  // Check Supabase session on mount and listen for auth changes
  useEffect(() => {
    const supabase = createClient();

    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? "",
          name: session.user.user_metadata?.full_name ?? session.user.email ?? "",
        });
        setIsAuthenticated(true);
        setCurrentView("tenantDashboard");
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? "",
          name: session.user.user_metadata?.full_name ?? session.user.email ?? "",
        });
        setIsAuthenticated(true);
        setCurrentView("tenantDashboard");
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setIsAuthenticated(false);
        setCurrentTenant(null);
        setTenants([]);
        setTenantEvents([]);
        setMembers([]);
        setCurrentView("frontpage");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load tenants when user logs in
  const loadTenants = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const supabase = createClient();

    // Get tenants where user is a member
    const { data, error } = await supabase
      .from("memberships")
      .select(`
        tenant_id,
        role,
        tenants (
          id,
          name,
          slug,
          created_by,
          created_at,
          join_password
        )
      `)
      .eq("user_id", user.id)
      .eq("status", "active");

    if (error) {
      console.error("Error loading tenants:", error);
      setLoading(false);
      return;
    }

    const loadedTenants: Tenant[] = data
      ?.filter((m) => m.tenants)
      .map((m) => {
        const t = m.tenants as unknown as Tenant;
        // Only include join_password if user is admin
        if (m.role !== 'admin') {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { join_password, ...rest } = t;
          return rest as Tenant;
        }
        return t;
      }) ?? [];

    setTenants(loadedTenants);
    setLoading(false);
  }, [user]);

  // Load tenants when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadTenants();
    }
  }, [isAuthenticated, user, loadTenants]);

  const selectTenant = useCallback(async (tenant: Tenant) => {
    if (!user) return;

    const supabase = createClient();

    // Check user's role in this tenant
    const { data: membership } = await supabase
      .from("memberships")
      .select("role")
      .eq("tenant_id", tenant.id)
      .eq("user_id", user.id)
      .single();

    setCurrentTenant(tenant);
    setIsAdmin(membership?.role === 'admin');
    setCurrentView("eventOverview");
  }, [user]);

  const createTenant = useCallback(async (name: string, joinPassword: string) => {
    if (!user) return { success: false, error: "Not authenticated" };

    const supabase = createClient();
    const slug = generateSlug(name);

    // Ensure user profile exists before creating membership
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile) {
      // Try to create profile if it doesn't exist
      const pendingDisplayName = typeof window !== 'undefined' ? localStorage.getItem('pending_display_name') : null;

      const { error: createProfileError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          email: user.email,
          display_name: pendingDisplayName || undefined,
          updated_at: new Date().toISOString(),
        });

      if (createProfileError) {
        console.error("Profile creation error:", createProfileError);
        // If it's an RLS error, continue anyway - the profile might be managed by triggers
        if (createProfileError.code === 'PGRST301' || createProfileError.message?.includes('row-level security')) {
          console.log("Continuing despite RLS error - profile might be managed by triggers");
        } else {
          return { success: false, error: "Profil konnte nicht erstellt werden: " + createProfileError.message };
        }
      } else {
        // Clear the pending display name from localStorage
        if (typeof window !== 'undefined' && pendingDisplayName) {
          localStorage.removeItem('pending_display_name');
        }
      }
    }

    // Verify if profile actually exists now
    const { data: verifiedProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    // Create tenant - only include created_by if profile exists
    const tenantData: { name: string; slug: string; join_password: string; created_by?: string } = {
      name,
      slug,
      join_password: joinPassword,
    };

    // Only add created_by if profile exists (to avoid foreign key constraint error)
    if (verifiedProfile) {
      tenantData.created_by = user.id;
    }

    const { data: newTenant, error: tenantError } = await supabase
      .from("tenants")
      .insert(tenantData)
      .select()
      .single();

    if (tenantError) {
      return { success: false, error: tenantError.message };
    }

    // Create membership as admin
    const { error: membershipError } = await supabase
      .from("memberships")
      .insert({
        tenant_id: newTenant.id,
        user_id: user.id,
        role: "admin",
        status: "active",
      });

    if (membershipError) {
      return { success: false, error: membershipError.message };
    }

    await loadTenants();
    return { success: true };
  }, [user, loadTenants]);

  const joinTenant = useCallback(async (tenantId: string, password: string) => {
    if (!user) return { success: false, error: "Not authenticated" };

    const supabase = createClient();

    // Ensure user profile exists before creating membership
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile) {
      // Try to create profile if it doesn't exist
      const pendingDisplayName = typeof window !== 'undefined' ? localStorage.getItem('pending_display_name') : null;

      const { error: createProfileError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          email: user.email,
          display_name: pendingDisplayName || undefined,
          updated_at: new Date().toISOString(),
        });

      if (createProfileError) {
        console.error("Profile creation error:", createProfileError);
        // If it's an RLS error, continue anyway - the profile might be managed by triggers
        if (createProfileError.code === 'PGRST301' || createProfileError.message?.includes('row-level security')) {
          console.log("Continuing despite RLS error - profile might be managed by triggers");
        } else {
          return { success: false, error: "Profil konnte nicht erstellt werden: " + createProfileError.message };
        }
      } else {
        // Clear the pending display name from localStorage
        if (typeof window !== 'undefined' && pendingDisplayName) {
          localStorage.removeItem('pending_display_name');
        }
      }
    }

    // Check password
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("id, join_password")
      .eq("id", tenantId)
      .single();

    if (tenantError || !tenant) {
      return { success: false, error: "Tenant not found" };
    }

    if (tenant.join_password !== password) {
      return { success: false, error: "Falsches Passwort" };
    }

    // Check if already a member
    const { data: existingMembership } = await supabase
      .from("memberships")
      .select("tenant_id")
      .eq("tenant_id", tenantId)
      .eq("user_id", user.id)
      .single();

    if (existingMembership) {
      return { success: false, error: "Du bist bereits Mitglied" };
    }

    // Create membership
    const { error: membershipError } = await supabase
      .from("memberships")
      .insert({
        tenant_id: tenantId,
        user_id: user.id,
        role: "member",
        status: "active",
      });

    if (membershipError) {
      return { success: false, error: membershipError.message };
    }

    await loadTenants();
    return { success: true };
  }, [user, loadTenants]);

  const searchTenants = useCallback(async (query: string): Promise<Tenant[]> => {
    if (!query || query.length < 2) return [];

    const supabase = createClient();

    const { data, error } = await supabase
      .from("tenants")
      .select("id, name, slug, created_by, created_at")
      .ilike("name", `%${query}%`)
      .limit(10);

    if (error) {
      console.error("Search error:", error);
      return [];
    }

    return data ?? [];
  }, []);

  const loadTenantEvents = useCallback(async () => {
    if (!currentTenant) return;

    const supabase = createClient();

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("tenant_id", currentTenant.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading events:", error);
      return;
    }

    setTenantEvents(data ?? []);
  }, [currentTenant]);

  const loadMembers = useCallback(async () => {
    if (!currentTenant) return;

    const supabase = createClient();

    const { data, error } = await supabase
      .from("memberships")
      .select(`
        user_id,
        tenant_id,
        role,
        status,
        created_at,
        profiles (
          email,
          display_name
        )
      `)
      .eq("tenant_id", currentTenant.id);

    if (error) {
      console.error("Error loading members:", error);
      return;
    }

    const loadedMembers: Member[] = data?.map((m) => ({
      user_id: m.user_id,
      tenant_id: m.tenant_id,
      role: m.role as 'admin' | 'member',
      status: m.status as 'active' | 'pending' | 'invited',
      created_at: m.created_at,
      email: (m.profiles as { email?: string })?.email,
      display_name: (m.profiles as { display_name?: string })?.display_name,
    })) ?? [];

    setMembers(loadedMembers);
  }, [currentTenant]);

  // Load spots for current event
  const loadSpots = useCallback(async () => {
    if (!currentTenantEvent) return;

    const supabase = createClient();

    const { data, error } = await supabase
      .from("spots")
      .select("*")
      .eq("event_id", currentTenantEvent.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading spots:", error);
      return;
    }

    setSpots(data ?? []);
  }, [currentTenantEvent]);

  // Load events and members when tenant changes
  useEffect(() => {
    if (currentTenant) {
      loadTenantEvents();
      loadMembers();
    }
  }, [currentTenant, loadTenantEvents, loadMembers]);

  // Load spots when event changes
  useEffect(() => {
    if (currentTenantEvent) {
      loadSpots();
    }
  }, [currentTenantEvent, loadSpots]);

  const createTenantEvent = useCallback(async (
    title: string,
    description: string,
    startsAt: string,
    endsAt: string,
    mapCenterAddress: string,
    mapCenterLat: number,
    mapCenterLng: number
  ) => {
    if (!currentTenant || !user) return { success: false, error: "No tenant selected" };

    const supabase = createClient();
    const slug = generateSlug(title);

    // Verify if profile exists
    const { data: verifiedProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    // Build event data - only include created_by if profile exists
    const eventData: {
      tenant_id: string;
      title: string;
      slug: string;
      description: string;
      starts_at?: string;
      ends_at?: string;
      map_center_address: string;
      map_center_lat: number;
      map_center_lng: number;
      status: string;
      created_by?: string;
    } = {
      tenant_id: currentTenant.id,
      title,
      slug,
      description,
      map_center_address: mapCenterAddress,
      map_center_lat: mapCenterLat,
      map_center_lng: mapCenterLng,
      status: "draft",
    };

    // Only add dates if they exist
    if (startsAt) eventData.starts_at = startsAt;
    if (endsAt) eventData.ends_at = endsAt;

    if (verifiedProfile) {
      eventData.created_by = user.id;
    }

    const { error } = await supabase
      .from("events")
      .insert(eventData);

    if (error) {
      return { success: false, error: error.message };
    }

    await loadTenantEvents();
    return { success: true };
  }, [currentTenant, user, loadTenantEvents]);

  const removeMember = useCallback(async (userId: string) => {
    if (!currentTenant || !isAdmin) return { success: false, error: "Not authorized" };

    const supabase = createClient();

    const { error } = await supabase
      .from("memberships")
      .delete()
      .eq("tenant_id", currentTenant.id)
      .eq("user_id", userId);

    if (error) {
      return { success: false, error: error.message };
    }

    await loadMembers();
    return { success: true };
  }, [currentTenant, isAdmin, loadMembers]);

  const updateMemberRole = useCallback(async (userId: string, role: 'admin' | 'member') => {
    if (!currentTenant || !isAdmin) return { success: false, error: "Not authorized" };

    const supabase = createClient();

    const { error } = await supabase
      .from("memberships")
      .update({ role })
      .eq("tenant_id", currentTenant.id)
      .eq("user_id", userId);

    if (error) {
      return { success: false, error: error.message };
    }

    await loadMembers();
    return { success: true };
  }, [currentTenant, isAdmin, loadMembers]);

  const updateUserProfile = useCallback(async (name: string, email?: string) => {
    if (!user) return { success: false, error: "Not authenticated" };

    const supabase = createClient();

    // Update user metadata (name)
    const { error: metaError } = await supabase.auth.updateUser({
      data: { full_name: name }
    });

    if (metaError) return { success: false, error: metaError.message };

    // Update profiles table display_name
    await supabase.from("profiles").upsert({
      id: user.id,
      display_name: name,
      email: email || user.email
    });

    let emailChanged = false;

    // If email changed, trigger verification
    if (email && email !== user.email) {
      const { error: emailError } = await supabase.auth.updateUser({ email });
      if (emailError) return { success: false, error: emailError.message };
      emailChanged = true;
    }

    // Update local state
    setUser({ ...user, name, email: emailChanged ? user.email : (email || user.email) });

    return { success: true, emailChanged };
  }, [user]);

  const updateTenant = useCallback(async (name: string, password: string) => {
    if (!currentTenant || !isAdmin) return { success: false, error: "Not authorized" };

    // Verify password
    if (password !== currentTenant.join_password) {
      return { success: false, error: "Falsches Passwort" };
    }

    const supabase = createClient();
    const slug = generateSlug(name);

    const { error } = await supabase
      .from("tenants")
      .update({ name, slug })
      .eq("id", currentTenant.id);

    if (error) return { success: false, error: error.message };

    // Update local state
    setCurrentTenant({ ...currentTenant, name, slug });
    await loadTenants();

    return { success: true };
  }, [currentTenant, isAdmin, loadTenants]);

  const deleteTenant = useCallback(async (password: string) => {
    if (!currentTenant || !isAdmin) return { success: false, error: "Not authorized" };

    // Verify password
    if (password !== currentTenant.join_password) {
      return { success: false, error: "Falsches Passwort" };
    }

    const supabase = createClient();

    // Delete all memberships first
    const { error: membershipError } = await supabase
      .from("memberships")
      .delete()
      .eq("tenant_id", currentTenant.id);

    if (membershipError) return { success: false, error: membershipError.message };

    // Delete all events (and their spots will be cascade deleted)
    const { error: eventsError } = await supabase
      .from("events")
      .delete()
      .eq("tenant_id", currentTenant.id);

    if (eventsError) return { success: false, error: eventsError.message };

    // Delete the tenant
    const { error: tenantError } = await supabase
      .from("tenants")
      .delete()
      .eq("id", currentTenant.id);

    if (tenantError) return { success: false, error: tenantError.message };

    // Clear local state
    setCurrentTenant(null);
    setTenantEvents([]);
    setMembers([]);
    await loadTenants();

    return { success: true };
  }, [currentTenant, isAdmin, loadTenants]);

  const findTenantBySlug = useCallback((slug: string): Tenant | undefined => {
    return tenants.find((t) => t.slug === slug);
  }, [tenants]);

  const findEventBySlug = useCallback((slug: string): TenantEvent | undefined => {
    return tenantEvents.find((e) => e.slug === slug);
  }, [tenantEvents]);

  const findEventBySlugOrId = useCallback((slugOrId: string): TenantEvent | undefined => {
    // Try to find by slug first, then by ID
    return tenantEvents.find((e) => e.slug === slugOrId || e.id === slugOrId);
  }, [tenantEvents]);

  const updateEvent = useCallback(async (eventId: string, data: Partial<TenantEvent>) => {
    if (!currentTenant || !user) return { success: false, error: "Not authorized" };

    const supabase = createClient();

    // If title is being updated, regenerate slug
    const updateData: Record<string, unknown> = { ...data };
    if (data.title) {
      updateData.slug = generateSlug(data.title);
    }

    const { error } = await supabase
      .from("events")
      .update(updateData)
      .eq("id", eventId);

    if (error) return { success: false, error: error.message };

    // Update local state
    if (currentTenantEvent?.id === eventId) {
      setCurrentTenantEvent({ ...currentTenantEvent, ...data });
    }
    await loadTenantEvents();

    return { success: true };
  }, [currentTenant, user, currentTenantEvent, loadTenantEvents]);

  const publishEvent = useCallback(async (eventId: string) => {
    if (!currentTenant || !user) return { success: false, error: "Not authorized" };

    const supabase = createClient();

    const { error } = await supabase
      .from("events")
      .update({ status: 'published' })
      .eq("id", eventId);

    if (error) return { success: false, error: error.message };

    // Update local state
    if (currentTenantEvent?.id === eventId) {
      setCurrentTenantEvent({ ...currentTenantEvent, status: 'published' });
    }
    await loadTenantEvents();

    return { success: true };
  }, [currentTenant, user, currentTenantEvent, loadTenantEvents]);

  const archiveEvent = useCallback(async (eventId: string) => {
    if (!currentTenant || !user) return { success: false, error: "Not authorized" };

    const supabase = createClient();

    const { error } = await supabase
      .from("events")
      .update({ status: 'archived' })
      .eq("id", eventId);

    if (error) return { success: false, error: error.message };

    // Update local state
    if (currentTenantEvent?.id === eventId) {
      setCurrentTenantEvent({ ...currentTenantEvent, status: 'archived' });
    }
    await loadTenantEvents();

    return { success: true };
  }, [currentTenant, user, currentTenantEvent, loadTenantEvents]);

  const deleteEvent = useCallback(async (eventId: string) => {
    if (!currentTenant || !user) return { success: false, error: "Not authorized" };

    const supabase = createClient();

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", eventId);

    if (error) return { success: false, error: error.message };

    // Clear current event if it was deleted
    if (currentTenantEvent?.id === eventId) {
      setCurrentTenantEvent(null);
    }
    await loadTenantEvents();

    return { success: true };
  }, [currentTenant, user, currentTenantEvent, loadTenantEvents]);

  const addSpot = useCallback(async (spotData: Omit<Spot, "id">): Promise<string | null> => {
    if (!currentTenantEvent || !currentTenant) return null;

    const supabase = createClient();

    const { data, error } = await supabase
      .from("spots")
      .insert({
        tenant_id: currentTenant.id,
        event_id: currentTenantEvent.id,
        title: spotData.title,
        public_note: spotData.public_note,
        internal_note: spotData.internal_note,
        street: spotData.street,
        house_number: spotData.house_number,
        zip: spotData.zip,
        city: spotData.city,
        address_raw: spotData.address_raw,
        address_public: spotData.address_public,
        lat: spotData.lat,
        lng: spotData.lng,
        geo_precision: spotData.geo_precision || 'exact',
        contact_name: spotData.contact_name,
        contact_email: spotData.contact_email,
        contact_phone: spotData.contact_phone,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding spot:", error);
      return null;
    }

    await loadSpots();
    return data?.id || null;
  }, [currentTenantEvent, currentTenant, loadSpots]);

  const deleteSpot = useCallback(async (id: string) => {
    // Only authorized tenant members can delete spots from admin dashboard
    if (!currentTenant || !user) {
      console.error("Not authorized to delete spot");
      return;
    }

    const supabase = createClient();

    const { error } = await supabase
      .from("spots")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting spot:", error);
      return;
    }

    await loadSpots();
  }, [currentTenant, user, loadSpots]);

  // Load deletion requests for current event
  const loadDeletionRequests = useCallback(async () => {
    if (!currentTenantEvent) return;

    const supabase = createClient();

    const { data, error } = await supabase
      .from("spot_deletion_requests")
      .select("*")
      .eq("event_id", currentTenantEvent.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading deletion requests:", error);
      return;
    }

    setDeletionRequests(data ?? []);
    setPendingDeletionCount(data?.filter(r => r.status === 'pending').length ?? 0);
  }, [currentTenantEvent]);

  // Request spot deletion (creates a pending request)
  const requestSpotDeletion = useCallback(
    async (
      spotId: string,
      requesterName: string,
      requesterEmail: string,
      requesterAddress: string,
      reason?: string
    ): Promise<{ success: boolean; error?: string }> => {
      const supabase = createClient();

      // Find the spot to get tenant and event info
      const spot = spots.find(s => s.id === spotId);
      if (!spot) {
        return { success: false, error: "Spot nicht gefunden" };
      }

      // Check if there's already a pending request for this spot
      const { data: existingRequests, error: checkError } = await supabase
        .from("spot_deletion_requests")
        .select("id")
        .eq("spot_id", spotId)
        .eq("status", "pending");

      if (checkError) {
        return { success: false, error: checkError.message };
      }

      if (existingRequests && existingRequests.length > 0) {
        return { success: false, error: "Für diesen Spot existiert bereits eine Löschanfrage" };
      }

      const { error } = await supabase
        .from("spot_deletion_requests")
        .insert({
          spot_id: spotId,
          tenant_id: spot.tenant_id,
          event_id: spot.event_id,
          status: "pending",
          requester_reason: reason,
          requester_name: requesterName,
          requester_email: requesterEmail,
          requester_address: requesterAddress,
        });

      if (error) {
        return { success: false, error: error.message };
      }

      // Reload deletion requests to update count
      await loadDeletionRequests();

      // TODO: Send email notification to organizers (Phase 5)

      return { success: true };
    },
    [spots, loadDeletionRequests]
  );

  // Approve deletion request and delete the spot
  const approveDeletionRequest = useCallback(
    async (requestId: string): Promise<{ success: boolean; error?: string }> => {
      if (!user) return { success: false, error: "Not authenticated" };

      const supabase = createClient();

      // Get the request to find the spot
      const { data: request, error: fetchError } = await supabase
        .from("spot_deletion_requests")
        .select("*")
        .eq("id", requestId)
        .single();

      if (fetchError || !request) {
        return { success: false, error: "Anfrage nicht gefunden" };
      }

      // Delete the spot
      const { error: deleteError } = await supabase
        .from("spots")
        .delete()
        .eq("id", request.spot_id);

      if (deleteError) {
        return { success: false, error: deleteError.message };
      }

      // Update the request status
      const { error: updateError } = await supabase
        .from("spot_deletion_requests")
        .update({
          status: "approved",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      // Reload data
      await loadSpots();
      await loadDeletionRequests();

      // TODO: Send email notification to requester (Phase 5)

      return { success: true };
    },
    [user, loadSpots, loadDeletionRequests]
  );

  // Reject deletion request
  const rejectDeletionRequest = useCallback(
    async (requestId: string, reviewerNote: string): Promise<{ success: boolean; error?: string }> => {
      if (!user) return { success: false, error: "Not authenticated" };

      const supabase = createClient();

      const { error } = await supabase
        .from("spot_deletion_requests")
        .update({
          status: "rejected",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          reviewer_note: reviewerNote,
        })
        .eq("id", requestId);

      if (error) {
        return { success: false, error: error.message };
      }

      // Reload deletion requests
      await loadDeletionRequests();

      // TODO: Send email notification to requester (Phase 5)

      return { success: true };
    },
    [user, loadDeletionRequests]
  );

  const deleteSpotByVerification = useCallback(
    async (
      addressRaw: string,
      contactName: string,
      contactEmail: string,
      reason?: string
    ): Promise<{ success: boolean; error?: string }> => {
      const spot = spots.find(
        (s) =>
          (s.address_raw?.trim() || '') === addressRaw.trim() &&
          (s.contact_name?.trim() || '') === contactName.trim() &&
          (s.contact_email?.trim() || '') === contactEmail.trim()
      );

      if (!spot) {
        return {
          success: false,
          error: "Es wurde kein Spot mit diesen exakten Daten gefunden."
        };
      }

      // Create a deletion request instead of immediate deletion
      const result = await requestSpotDeletion(
        spot.id,
        contactName,
        contactEmail,
        addressRaw,
        reason
      );

      return result;
    },
    [spots, requestSpotDeletion]
  );

  const createEvent = useCallback(
    (title: string, date: string, startTime: string, endTime: string) => {
      const slug = generateSlug(title);
      const publicLink = `${window.location.origin}${window.location.pathname}#event/${slug}`;

      setCurrentEvent({
        id: Date.now().toString(),
        title,
        date,
        startTime,
        endTime,
        link: publicLink,
      });
    },
    []
  );

  const logout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
    setCurrentTenant(null);
    setTenants([]);
    setTenantEvents([]);
    setMembers([]);
    setCurrentView("frontpage");

    // Redirect to flohmarkt home page
    if (typeof window !== 'undefined') {
      window.location.href = '/flohmarkt';
    }
  }, []);

  const getAllEmails = useCallback(() => {
    return [...new Set(spots.map((s) => s.contact_email).filter((c): c is string => !!c && c.includes("@")))];
  }, [spots]);

  // Load deletion requests when event changes
  useEffect(() => {
    if (currentTenantEvent) {
      loadDeletionRequests();
    }
  }, [currentTenantEvent, loadDeletionRequests]);

  return (
    <FlohmarktContext.Provider
      value={{
        spots,
        currentEvent,
        currentView,
        currentTab,
        isAuthenticated,
        user,
        deletePreFill,
        highlightedSpotId,
        tenants,
        currentTenant,
        tenantEvents,
        members,
        isAdmin,
        loading,
        currentTenantEvent,
        setCurrentView,
        setCurrentTab,
        addSpot,
        deleteSpot,
        deleteSpotByVerification,
        createEvent,
        logout,
        setDeletePreFill,
        setHighlightedSpotId,
        getAllEmails,
        loadTenants,
        selectTenant,
        setCurrentTenant,
        createTenant,
        joinTenant,
        searchTenants,
        loadTenantEvents,
        loadMembers,
        createTenantEvent,
        removeMember,
        updateMemberRole,
        setCurrentTenantEvent,
        updateUserProfile,
        updateTenant,
        deleteTenant,
        findTenantBySlug,
        findEventBySlug,
        findEventBySlugOrId,
        updateEvent,
        publishEvent,
        archiveEvent,
        deleteEvent,
        deletionRequests,
        pendingDeletionCount,
        requestSpotDeletion,
        loadDeletionRequests,
        approveDeletionRequest,
        rejectDeletionRequest,
      }}
    >
      {children}
    </FlohmarktContext.Provider>
  );
}

export function useFlohmarkt() {
  const context = useContext(FlohmarktContext);
  if (!context) {
    throw new Error("useFlohmarkt must be used within a FlohmarktProvider");
  }
  return context;
}
