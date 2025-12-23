"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Tenant, TenantEvent } from "../types";

export default function OrganizationPublicPage() {
  const params = useParams();
  const organizationSlug = params.organizationSlug as string;

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [events, setEvents] = useState<TenantEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrganizationData = async () => {
      if (!organizationSlug) return;

      setLoading(true);
      setError(null);

      try {
        const supabase = createClient();

        // Find the tenant by slug
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

        const loadedTenant: Tenant = {
          id: tenantData.id,
          name: tenantData.name,
          slug: tenantData.slug,
          created_by: tenantData.created_by,
          created_at: tenantData.created_at,
        };

        setTenant(loadedTenant);

        // Load all published events for this tenant
        const { data: eventsData, error: eventsError } = await supabase
          .from("events")
          .select("*")
          .eq("tenant_id", loadedTenant.id)
          .eq("status", "published")
          .order("starts_at", { ascending: false });

        if (eventsError) {
          console.error("Error loading events:", eventsError);
        } else {
          const loadedEvents: TenantEvent[] = (eventsData || []).map((e) => ({
            id: e.id,
            tenant_id: e.tenant_id,
            title: e.title,
            slug: e.slug,
            description: e.description,
            starts_at: e.starts_at,
            ends_at: e.ends_at,
            status: e.status,
            map_center_lat: e.map_center_lat,
            map_center_lng: e.map_center_lng,
            map_center_address: e.map_center_address,
            created_by: e.created_by,
            created_at: e.created_at,
          }));
          setEvents(loadedEvents);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error loading organization:", err);
        setError("Fehler beim Laden der Organisation.");
        setLoading(false);
      }
    };

    loadOrganizationData();
  }, [organizationSlug]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003366] mx-auto mb-4"></div>
          <p className="text-[#003366] font-medium">Organisation wird geladen...</p>
        </div>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="fixed inset-0 bg-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-[#003366] mb-2">Organisation nicht gefunden</h2>
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

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="bg-[#003366] text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/flohmarkt"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm mb-3 no-underline"
          >
            <span>←</span>
            <span>Zurück zur Startseite</span>
          </Link>
          <h1 className="text-3xl font-bold m-0">{tenant.name}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-[#003366] mb-6">Veranstaltungen</h2>

          {events.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">Keine Veranstaltungen</h3>
              <p className="text-gray-600">
                Diese Organisation hat derzeit keine veröffentlichten Veranstaltungen.
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {events.map((event) => (
                <Link
                  key={event.id}
                  href={`/flohmarkt/${tenant.slug}/${event.slug || event.id}`}
                  className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 no-underline"
                >
                  <h3 className="text-xl font-bold text-[#003366] mb-2 m-0">
                    {event.title}
                  </h3>
                  {event.description && (
                    <p className="text-gray-600 mb-3">{event.description}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    {event.starts_at && (
                      <div className="flex items-center gap-2">
                        <span>📅</span>
                        <span>Start: {formatDate(event.starts_at)}</span>
                      </div>
                    )}
                    {event.ends_at && (
                      <div className="flex items-center gap-2">
                        <span>🏁</span>
                        <span>Ende: {formatDate(event.ends_at)}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 text-[#003366] font-medium flex items-center gap-2">
                    <span>Zur Veranstaltung</span>
                    <span>→</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
