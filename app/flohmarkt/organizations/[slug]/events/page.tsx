"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFlohmarkt } from "../../../FlohmarktContext";
import { EventOverview } from "../../../components/tenant/EventOverview";

export default function EventsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { findTenantBySlug, selectTenant, currentTenant, loading, isAuthenticated, tenants } = useFlohmarkt();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Auto-select tenant based on URL slug
  useEffect(() => {
    if (slug && currentTenant?.slug !== slug) {
      const tenant = findTenantBySlug(slug);
      if (tenant) {
        selectTenant(tenant);
      }
    }
  }, [slug, currentTenant?.slug, findTenantBySlug, selectTenant]);

  // Track when initial load is complete
  useEffect(() => {
    // If we have a tenant or we're not authenticated or tenants are loaded but slug not found
    if (currentTenant || !isAuthenticated || (tenants.length > 0 && !findTenantBySlug(slug))) {
      setInitialLoadComplete(true);
    }
  }, [currentTenant, isAuthenticated, tenants.length, slug, findTenantBySlug]);

  // Add timeout for loading state - trigger if stuck loading
  useEffect(() => {
    if (!initialLoadComplete) {
      const timer = setTimeout(() => {
        setLoadingTimeout(true);
      }, 10000); // 10 seconds timeout

      return () => clearTimeout(timer);
    }
  }, [initialLoadComplete]);

  if (loadingTimeout) {
    return (
      <div className="fixed inset-0 bg-gray-100 z-[3500] flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 p-8 rounded-lg text-center max-w-md">
          <h2 className="text-red-600 mt-0">Laden fehlgeschlagen</h2>
          <p className="text-gray-600 mb-6">
            Die Events konnten nicht geladen werden. Möglicherweise bist du nicht mehr angemeldet oder hast keinen Zugriff auf diese Organisation.
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

  if (loading || !currentTenant) {
    return (
      <div className="fixed inset-0 bg-gray-100 z-[3500] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366] mx-auto mb-4"></div>
          <p className="text-[#003366] font-semibold">Lade Events...</p>
        </div>
      </div>
    );
  }

  return <EventOverview />;
}
