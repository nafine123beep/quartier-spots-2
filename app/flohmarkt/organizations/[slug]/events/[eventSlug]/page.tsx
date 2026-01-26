"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFlohmarkt } from "../../../../FlohmarktContext";
import { EventDetail } from "../../../../components/dashboard/EventDetail";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
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
    loading,
    user,
    isAuthenticated
  } = useFlohmarkt();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

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

  // Track when we've checked authentication status
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasCheckedAuth(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Add timeout for loading state - trigger if stuck loading for too long
  useEffect(() => {
    if (!hasCheckedAuth) return;

    const timer = setTimeout(() => {
      if (!user || !isAuthenticated || !currentTenant || !currentTenantEvent) {
        setLoadingTimeout(true);
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [hasCheckedAuth, user, isAuthenticated, currentTenant, currentTenantEvent]);

  if (loadingTimeout) {
    return (
      <div className="fixed inset-0 bg-gray-100 z-[3500] flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 p-8 rounded-lg text-center max-w-md">
          <h2 className="text-red-600 mt-0">Laden fehlgeschlagen</h2>
          <p className="text-gray-600 mb-6">
            Das Event konnte nicht geladen werden. Möglicherweise bist du nicht mehr angemeldet oder hast keinen Zugriff auf dieses Event.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => window.location.reload()}
              className="bg-[#003366] text-white px-6 py-3 rounded-md font-bold cursor-pointer hover:bg-[#002244]"
            >
              Neu laden
            </button>
            <button
              onClick={() => router.push('/flohmarkt/organizations')}
              className="bg-white border-2 border-[#003366] text-[#003366] px-6 py-3 rounded-md font-bold cursor-pointer hover:bg-gray-50"
            >
              Zu Organisationen
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !currentTenant || !currentTenantEvent) {
    return (
      <div className="fixed inset-0 bg-gray-100 z-[3500] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366] mx-auto mb-4"></div>
          <p className="text-[#003366] font-semibold">Lade Event...</p>
        </div>
      </div>
    );
  }

  return <EventDetail />;
}
