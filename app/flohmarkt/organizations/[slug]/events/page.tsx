"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useFlohmarkt } from "../../../FlohmarktContext";
import { EventOverview } from "../../../components/tenant/EventOverview";

export default function EventsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { findTenantBySlug, selectTenant, currentTenant, loading } = useFlohmarkt();

  // Auto-select tenant based on URL slug
  useEffect(() => {
    if (slug && currentTenant?.slug !== slug) {
      const tenant = findTenantBySlug(slug);
      if (tenant) {
        selectTenant(tenant);
      }
    }
  }, [slug, currentTenant?.slug, findTenantBySlug, selectTenant]);

  if (loading || !currentTenant) {
    return (
      <div className="fixed inset-0 bg-gray-100 z-[3500] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366] mx-auto mb-4"></div>
          <p>Lade Events...</p>
        </div>
      </div>
    );
  }

  return <EventOverview />;
}
