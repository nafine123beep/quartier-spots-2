"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useFlohmarkt } from "../../FlohmarktContext";
import { PublicEventView } from "../../components/event/PublicEventView";
import { TenantEvent, Tenant } from "../../types";

export default function PublicEventPage() {
  const params = useParams();
  const organizationSlug = params.organizationSlug as string;
  const eventSlug = params.eventSlug as string;

  const { setCurrentTenantEvent, setCurrentTenant, isAdmin, user } = useFlohmarkt();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load event and tenant data from Supabase (public access, no login required)
  useEffect(() => {
    const loadPublicEventData = async () => {
      if (!organizationSlug || !eventSlug) return;

      setLoading(true);
      setError(null);

      try {
        const supabase = createClient();

        // First, find the tenant by slug
        const { data: tenantData, error: tenantError } = await supabase
          .from("tenants")
          .select("id, name, slug, created_by, created_at")
          .eq("slug", organizationSlug)
          .single();

        if (tenantError || !tenantData) {
          setError("Organisation nicht gefunden.");
          setLoading(false);
          return;
        }

        // Convert to Tenant type
        const tenant: Tenant = {
          id: tenantData.id,
          name: tenantData.name,
          slug: tenantData.slug,
          created_by: tenantData.created_by,
          created_at: tenantData.created_at,
        };

        // Then find the event by slug or ID for this tenant
        // Check if eventSlug is a UUID (for backward compatibility with old links)
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(eventSlug);

        // Build OR condition - only check ID if eventSlug is a valid UUID
        let orCondition: string;
        if (isUUID) {
          // eventSlug is a UUID, check both slug and id
          if (!user || !isAdmin) {
            orCondition = `and(slug.eq.${eventSlug},status.eq.published),and(id.eq.${eventSlug},status.eq.published)`;
          } else {
            orCondition = `slug.eq.${eventSlug},id.eq.${eventSlug}`;
          }
        } else {
          // eventSlug is just a slug, only check slug field
          if (!user || !isAdmin) {
            orCondition = `and(slug.eq.${eventSlug},status.eq.published)`;
          } else {
            orCondition = `slug.eq.${eventSlug}`;
          }
        }

        const eventQuery = supabase
          .from("events")
          .select("*")
          .eq("tenant_id", tenant.id)
          .or(orCondition);

        // Execute query
        const { data: eventData, error: eventError } = await eventQuery.single();

        if (eventError || !eventData) {
          console.error("Event query error:", eventError);
          console.log("Searching for event slug/id:", eventSlug);
          console.log("In tenant:", tenant.slug, tenant.id);
          console.log("Is admin:", isAdmin, "User:", user?.email);
          setError("Event nicht gefunden oder nicht veröffentlicht.");
          setLoading(false);
          return;
        }

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
          created_by: eventData.created_by,
          created_at: eventData.created_at,
        };

        // Set the current tenant and event in context
        setCurrentTenant(tenant);
        setCurrentTenantEvent(event);
        setLoading(false);
      } catch (err) {
        console.error("Error loading public event:", err);
        setError("Fehler beim Laden des Events.");
        setLoading(false);
      }
    };

    loadPublicEventData();
  }, [organizationSlug, eventSlug, setCurrentTenantEvent, setCurrentTenant, user, isAdmin]);

  // Show loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003366] mx-auto mb-4"></div>
          <p className="text-[#003366] font-medium">Event wird geladen...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="fixed inset-0 bg-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-[#003366] mb-2">Event nicht gefunden</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <a
            href="/flohmarkt"
            className="inline-block bg-[#003366] text-white px-6 py-3 rounded-md font-bold hover:bg-[#002244] no-underline"
          >
            Zurück zur Startseite
          </a>
        </div>
      </div>
    );
  }

  return <PublicEventView />;
}
