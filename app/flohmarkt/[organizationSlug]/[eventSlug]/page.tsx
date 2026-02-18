"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { XCircle } from "lucide-react";
import { useFlohmarkt } from "../../FlohmarktContext";
import { PublicEventView } from "../../components/event/PublicEventView";
import { loadEventData, AccessMode } from "../../lib/loadEventData";

// Loading spinner component
function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003366] mx-auto mb-4"></div>
        <p className="text-[#003366] font-medium">Event wird geladen...</p>
      </div>
    </div>
  );
}

// Main page wrapper with Suspense for useSearchParams
export default function PublicEventPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PublicEventPageContent />
    </Suspense>
  );
}

function PublicEventPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const organizationSlug = params.organizationSlug as string;
  const eventSlug = params.eventSlug as string;
  const isEmbedded = searchParams.get('embedded') === 'true';

  const { setCurrentTenantEvent, setCurrentTenant } = useFlohmarkt();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessMode, setAccessMode] = useState<AccessMode>('public');

  // Track if data has been loaded (using ref to avoid re-renders)
  const hasLoadedRef = useRef(false);

  // Load event and tenant data from Supabase (public access, no login required)
  useEffect(() => {
    // Guard: Only run once - MUST be checked synchronously before any async work
    if (hasLoadedRef.current) return;

    // Early return if params not available
    if (!organizationSlug || !eventSlug) {
      setLoading(false);
      return;
    }

    // Set flag IMMEDIATELY (synchronously) to prevent race conditions
    hasLoadedRef.current = true;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await loadEventData(organizationSlug, eventSlug, null);

        if (result.error) {
          setError(result.error);
          return;
        }

        if (result.tenant && result.event) {
          setCurrentTenant(result.tenant);
          setCurrentTenantEvent(result.event);
          setAccessMode(result.accessMode || 'public');
        } else {
          setError("Fehler beim Laden des Events.");
        }
      } catch (err) {
        console.error("Unexpected error loading event:", err);
        setError("Unerwarteter Fehler beim Laden des Events.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationSlug, eventSlug]); // Only route params - setters are stable

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-4 flex justify-center"><XCircle className="h-16 w-16 text-red-500" /></div>
          <h2 className="text-2xl font-bold text-[#003366] mb-2">Event nicht gefunden</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          {!isEmbedded && (
            <a
              href="/flohmarkt"
              className="inline-block bg-[#003366] text-white px-6 py-3 rounded-md font-bold hover:bg-[#002244] no-underline"
            >
              Zurück zur Startseite
            </a>
          )}
        </div>
      </div>
    );
  }

  return <PublicEventView accessMode={accessMode} embedded={isEmbedded} />;
}
