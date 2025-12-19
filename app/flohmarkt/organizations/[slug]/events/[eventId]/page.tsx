"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useFlohmarkt } from "../../../../FlohmarktContext";
import { EventDetail } from "../../../../components/dashboard/EventDetail";

export default function EventDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const eventId = params.eventId as string;
  const {
    findTenantBySlug,
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

  // Auto-select event based on URL param
  useEffect(() => {
    if (eventId && tenantEvents.length > 0 && currentTenantEvent?.id !== eventId) {
      const event = tenantEvents.find((e) => e.id === eventId);
      if (event) {
        setCurrentTenantEvent(event);
      }
    }
  }, [eventId, tenantEvents, currentTenantEvent?.id, setCurrentTenantEvent]);

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
