"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useFlohmarkt } from "../../../../FlohmarktContext";
import { EventDetail } from "../../../../components/dashboard/EventDetail";

export default function EventDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const eventSlug = params.eventSlug as string;
  const {
    findTenantBySlug,
    findEventBySlugOrId,
    selectTenant,
    currentTenant,
    tenantEvents,
    setCurrentTenantEvent,
    currentTenantEvent,
    loading
  } = useFlohmarkt();

  // Auto-select tenant based on URL slug
  useEffect(() => {
    if (slug && currentTenant?.slug !== slug) {
      const tenant = findTenantBySlug(slug);
      if (tenant) {
        selectTenant(tenant);
      }
    }
  }, [slug, currentTenant?.slug, findTenantBySlug, selectTenant]);

  // Auto-select event based on URL slug or ID (fallback for events without slugs)
  useEffect(() => {
    if (eventSlug && tenantEvents.length > 0) {
      // Check if current event matches either by slug or ID
      const isCurrentEvent = currentTenantEvent?.slug === eventSlug || currentTenantEvent?.id === eventSlug;
      if (!isCurrentEvent) {
        const event = findEventBySlugOrId(eventSlug);
        if (event) {
          setCurrentTenantEvent(event);
        }
      }
    }
  }, [eventSlug, tenantEvents, currentTenantEvent?.slug, currentTenantEvent?.id, findEventBySlugOrId, setCurrentTenantEvent]);

  if (loading || !currentTenant || !currentTenantEvent) {
    return (
      <div className="fixed inset-0 bg-gray-100 z-[3500] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366] mx-auto mb-4"></div>
          <p>Lade Event...</p>
        </div>
      </div>
    );
  }

  return <EventDetail />;
}
