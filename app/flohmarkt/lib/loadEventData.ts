import { createClient } from "@/lib/supabase/client";
import { Tenant, TenantEvent, User, EventImage } from "../types";

export type AccessMode = 'member' | 'public';

export interface LoadEventDataResult {
  tenant?: Tenant;
  event?: TenantEvent;
  error?: string;
  accessMode?: AccessMode;
}

/**
 * Loads event and tenant data from Supabase
 * Handles permission checking for active vs archived events
 * Can be used by any page that needs to load event data
 *
 * @param organizationSlug - The slug of the organization/tenant
 * @param eventSlug - The slug or ID of the event
 * @param user - The currently logged in user (or null)
 */
export async function loadEventData(
  organizationSlug: string,
  eventSlug: string,
  user: User | null
): Promise<LoadEventDataResult> {
  if (!organizationSlug || !eventSlug) {
    return { error: "Ungültige Parameter." };
  }

  try {
    const supabase = createClient();

    // First, find the tenant by slug
    const { data: tenantData, error: tenantError } = await supabase
      .from("tenants")
      .select("id, name, slug, created_by, created_at")
      .eq("slug", organizationSlug)
      .single();

    console.log(`[loadEventData] Looking for tenant with slug: ${organizationSlug}`);
    console.log(`[loadEventData] Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
    console.log(`[loadEventData] Tenant query result:`, { tenantData, error: tenantError?.message });

    if (tenantError || !tenantData) {
      return { error: "Organisation nicht gefunden." };
    }

    // Convert to Tenant type
    const tenant: Tenant = {
      id: tenantData.id,
      name: tenantData.name,
      slug: tenantData.slug,
      created_by: tenantData.created_by,
      created_at: tenantData.created_at,
    };

    // Check if user is a member of this tenant
    let isMember = false;
    if (user) {
      const { data: membershipData } = await supabase
        .from("memberships")
        .select("user_id")
        .eq("tenant_id", tenant.id)
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      isMember = !!membershipData;
    }

    console.log("User:", user?.email, "Is member of tenant:", isMember);

    // Then find the event by slug or ID for this tenant
    // Check if eventSlug is a UUID (for backward compatibility with old links)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(eventSlug);

    // Build query based on user's membership status
    // Include event_images in the select for all queries
    const selectWithImages = `
      *,
      images:event_images (
        id,
        event_id,
        storage_path,
        filename,
        position,
        is_cover,
        created_at
      )
    `;

    let eventQuery;
    let accessMode: AccessMode = 'public';

    if (user && isMember) {
      // Members can see all events (including archived)
      accessMode = 'member';
      if (isUUID) {
        eventQuery = supabase
          .from("events")
          .select(selectWithImages)
          .eq("tenant_id", tenant.id)
          .or(`slug.eq.${eventSlug},id.eq.${eventSlug}`);
      } else {
        eventQuery = supabase
          .from("events")
          .select(selectWithImages)
          .eq("tenant_id", tenant.id)
          .eq("slug", eventSlug);
      }
    } else {
      // Non-members can only see active events
      accessMode = 'public';
      if (isUUID) {
        eventQuery = supabase
          .from("events")
          .select(selectWithImages)
          .eq("tenant_id", tenant.id)
          .eq("status", "active")
          .or(`slug.eq.${eventSlug},id.eq.${eventSlug}`);
      } else {
        eventQuery = supabase
          .from("events")
          .select(selectWithImages)
          .eq("tenant_id", tenant.id)
          .eq("status", "active")
          .eq("slug", eventSlug);
      }
    }

    // Execute query
    const { data: eventData, error: eventError } = await eventQuery.single();

    if (eventError || !eventData) {
      console.error("Event query error:", eventError);
      console.log("Searching for event slug/id:", eventSlug);
      console.log("In tenant:", tenant.slug, tenant.id);
      console.log("Is member:", isMember, "User:", user?.email, "Access mode:", accessMode);

      if (!user) {
        return {
          error: "Event nicht gefunden oder nicht verfügbar."
        };
      } else if (!isMember) {
        return {
          error: "Event nicht gefunden oder nicht verfügbar. Nur Mitglieder der Organisation können archivierte Events sehen."
        };
      } else {
        return { error: "Event nicht gefunden." };
      }
    }

    // Sort images by position
    // Note: PostgREST doesn't support ordering embedded resources directly in the query,
    // so we sort in JavaScript. This is efficient since image arrays are typically small (<10 items).
    const sortedImages: EventImage[] = (eventData.images ?? [])
      .sort((a: { position: number }, b: { position: number }) => a.position - b.position);

    // Convert to TenantEvent type
    const event: TenantEvent = {
      id: eventData.id,
      tenant_id: eventData.tenant_id,
      title: eventData.title,
      slug: eventData.slug,
      description: eventData.description,
      starts_at: eventData.starts_at,
      ends_at: eventData.ends_at,
      status: eventData.status,
      map_center_lat: eventData.map_center_lat,
      map_center_lng: eventData.map_center_lng,
      map_center_address: eventData.map_center_address,
      boundary_radius_meters: eventData.boundary_radius_meters,
      spot_term_singular: eventData.spot_term_singular,
      spot_term_plural: eventData.spot_term_plural,
      created_by: eventData.created_by,
      created_at: eventData.created_at,
      images: sortedImages,
    };

    return { tenant, event, accessMode };
  } catch (err) {
    console.error("Error loading public event:", err);
    return { error: "Fehler beim Laden des Events." };
  }
}
