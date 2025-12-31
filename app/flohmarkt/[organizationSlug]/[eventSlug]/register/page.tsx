"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useFlohmarkt } from "../../../FlohmarktContext";
import { RegistrationConfirmationPage } from "../../../components/event/RegistrationConfirmationPage";
import { loadEventData, AccessMode } from "../../../lib/loadEventData";

export default function RegisterPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const organizationSlug = params.organizationSlug as string;
  const eventSlug = params.eventSlug as string;
  const previewToken = searchParams.get('preview');

  const { setCurrentTenantEvent, setCurrentTenant, user } = useFlohmarkt();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessMode, setAccessMode] = useState<AccessMode>('public');

  // Load event and tenant data from Supabase (public access, no login required)
  useEffect(() => {
    const loadData = async () => {
      if (!organizationSlug || !eventSlug) return;

      setLoading(true);
      setError(null);

      const result = await loadEventData(organizationSlug, eventSlug, user, previewToken);

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      if (result.tenant && result.event) {
        // Set the current tenant and event in context
        setCurrentTenant(result.tenant);
        setCurrentTenantEvent(result.event);
        setAccessMode(result.accessMode || 'public');
        setLoading(false);
      } else {
        setError("Fehler beim Laden des Events.");
        setLoading(false);
      }
    };

    loadData();
  }, [organizationSlug, eventSlug, setCurrentTenantEvent, setCurrentTenant, user, previewToken]);

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

  return <RegistrationConfirmationPage accessMode={accessMode} />;
}
