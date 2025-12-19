"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { Spot, FlohmarktEvent, ViewType, AppTabType, User, Tenant, Member, TenantEvent } from "./types";

// Initial demo data
const INITIAL_SPOTS: Spot[] = [
  {
    id: "1",
    description: "Spielzeug & Bücher",
    address: "Rüsternweg 50, Nürnberg",
    lat: 49.417652,
    lng: 11.055152,
    name: "Max Mustermann",
    contact: "max@test.de",
    consent: true,
  },
  {
    id: "2",
    description: "Vintage Kleidung",
    address: "Heisterstraße 60, Nürnberg",
    lat: 49.423576,
    lng: 11.062553,
    name: "Anna Schmidt",
    contact: "0170-1234567",
    consent: true,
  },
  {
    id: "3",
    description: "Omas Geschirr",
    address: "Mustergasse 12, Nürnberg",
    lat: 49.42,
    lng: 11.06,
    name: "",
    contact: "",
    consent: true,
  },
];

interface FlohmarktContextType {
  // State
  spots: Spot[];
  currentEvent: FlohmarktEvent | null;
  currentView: ViewType;
  currentTab: AppTabType;
  isAuthenticated: boolean;
  user: User | null;
  deletePreFill: string;

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
  addSpot: (spot: Omit<Spot, "id">) => void;
  deleteSpot: (id: string) => void;
  deleteSpotByVerification: (address: string, name: string, contact: string) => boolean;
  createEvent: (title: string, date: string, startTime: string, endTime: string) => void;
  logout: () => void;
  setDeletePreFill: (address: string) => void;
  getAllEmails: () => string[];

  // Tenant actions
  loadTenants: () => Promise<void>;
  selectTenant: (tenant: Tenant) => Promise<void>;
  createTenant: (name: string, joinPassword: string) => Promise<{ success: boolean; error?: string }>;
  joinTenant: (tenantId: string, password: string) => Promise<{ success: boolean; error?: string }>;
  searchTenants: (query: string) => Promise<Tenant[]>;
  loadTenantEvents: () => Promise<void>;
  loadMembers: () => Promise<void>;
  createTenantEvent: (title: string, description: string, startsAt: string, endsAt: string) => Promise<{ success: boolean; error?: string }>;
  removeMember: (userId: string) => Promise<{ success: boolean; error?: string }>;
  updateMemberRole: (userId: string, role: 'admin' | 'member') => Promise<{ success: boolean; error?: string }>;
  setCurrentTenantEvent: (event: TenantEvent) => void;
  currentTenantEvent: TenantEvent | null;

  // Profile & Tenant update actions
  updateUserProfile: (name: string, email?: string) => Promise<{ success: boolean; error?: string; emailChanged?: boolean }>;
  updateTenant: (name: string) => Promise<{ success: boolean; error?: string }>;

  // Tenant lookup
  findTenantBySlug: (slug: string) => Tenant | undefined;
}

const FlohmarktContext = createContext<FlohmarktContextType | null>(null);

export function FlohmarktProvider({ children }: { children: ReactNode }) {
  const [spots, setSpots] = useState<Spot[]>(INITIAL_SPOTS);
  const [currentEvent, setCurrentEvent] = useState<FlohmarktEvent | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>("frontpage");
  const [currentTab, setCurrentTab] = useState<AppTabType>("list");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [deletePreFill, setDeletePreFill] = useState("");

  // Tenant state
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [tenantEvents, setTenantEvents] = useState<TenantEvent[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentTenantEvent, setCurrentTenantEvent] = useState<TenantEvent | null>(null);

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
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

    // Create tenant
    const { data: newTenant, error: tenantError } = await supabase
      .from("tenants")
      .insert({
        name,
        slug,
        join_password: joinPassword,
        created_by: user.id,
      })
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

  // Load events and members when tenant changes
  useEffect(() => {
    if (currentTenant) {
      loadTenantEvents();
      loadMembers();
    }
  }, [currentTenant, loadTenantEvents, loadMembers]);

  const createTenantEvent = useCallback(async (
    title: string,
    description: string,
    startsAt: string,
    endsAt: string
  ) => {
    if (!currentTenant || !user) return { success: false, error: "No tenant selected" };

    const supabase = createClient();

    const { error } = await supabase
      .from("events")
      .insert({
        tenant_id: currentTenant.id,
        title,
        description,
        starts_at: startsAt || null,
        ends_at: endsAt || null,
        status: "draft",
        created_by: user.id,
      });

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

  const updateTenant = useCallback(async (name: string) => {
    if (!currentTenant || !isAdmin) return { success: false, error: "Not authorized" };

    const supabase = createClient();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

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

  const findTenantBySlug = useCallback((slug: string): Tenant | undefined => {
    return tenants.find((t) => t.slug === slug);
  }, [tenants]);

  const addSpot = useCallback((spotData: Omit<Spot, "id">) => {
    const newSpot: Spot = {
      ...spotData,
      id: Date.now().toString(),
    };
    setSpots((prev) => [...prev, newSpot]);
  }, []);

  const deleteSpot = useCallback((id: string) => {
    setSpots((prev) => prev.filter((spot) => spot.id !== id));
  }, []);

  const deleteSpotByVerification = useCallback(
    (address: string, name: string, contact: string): boolean => {
      const index = spots.findIndex(
        (s) =>
          s.address.trim() === address.trim() &&
          s.name.trim() === name.trim() &&
          s.contact.trim() === contact.trim()
      );
      if (index > -1) {
        setSpots((prev) => prev.filter((_, i) => i !== index));
        return true;
      }
      return false;
    },
    [spots]
  );

  const createEvent = useCallback(
    (title: string, date: string, startTime: string, endTime: string) => {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
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
  }, []);

  const getAllEmails = useCallback(() => {
    return [...new Set(spots.map((s) => s.contact).filter((c) => c && c.includes("@")))];
  }, [spots]);

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
        getAllEmails,
        loadTenants,
        selectTenant,
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
        findTenantBySlug,
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
