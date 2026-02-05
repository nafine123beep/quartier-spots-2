"use client";

import { useState, useEffect } from "react";
import { useFlohmarkt } from "../../../../FlohmarktContext";
import { Eye, Maximize2, X, Loader2 } from "lucide-react";

interface PreviewStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function PreviewStep({ onNext, onBack }: PreviewStepProps) {
  const { currentTenantEvent, currentTenant } = useFlohmarkt();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showFullscreenModal, setShowFullscreenModal] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Build preview URL - now uses direct event URL since events are always active
  useEffect(() => {
    if (!currentTenantEvent || !currentTenant) return;

    const baseUrl = window.location.origin;
    const eventUrl = `${baseUrl}/flohmarkt/${currentTenant.slug}/${currentTenantEvent.slug}`;
    setPreviewUrl(`${eventUrl}?embedded=true&tab=map`);
  }, [currentTenantEvent, currentTenant]);

  if (!currentTenantEvent || !currentTenant) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-5">
        <h2 className="text-lg font-bold text-[#003366] mb-2 flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Vorschau
        </h2>
        <p className="text-gray-600">
          So sehen Teilnehmer dein Event. Überprüfe, ob alle Informationen korrekt sind.
        </p>
      </div>

      {/* Preview area */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {previewUrl ? (
          // Show iframe preview (map view forced via &tab=map)
          <div>
            <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Teilnehmer-Ansicht
              </span>
              <button
                onClick={() => setShowFullscreenModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Maximize2 className="h-4 w-4" />
                Vollbild
              </button>
            </div>
            <div className="relative" style={{ height: "60vh", minHeight: "400px" }}>
              {!iframeLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              )}
              <iframe
                src={previewUrl}
                className="w-full h-full border-0"
                title="Event-Vorschau"
                onLoad={() => setIframeLoaded(true)}
              />
            </div>
          </div>
        ) : (
          // Loading state
          <div className="p-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-[#003366] mx-auto mb-4" />
            <p className="text-gray-600">Vorschau wird geladen…</p>
          </div>
        )}
      </div>

      {/* Fullscreen modal */}
      {showFullscreenModal && previewUrl && (
        <div className="fixed inset-0 bg-black/90 z-[4000] flex flex-col">
          <div className="flex items-center justify-between p-4 bg-white border-b">
            <h3 className="font-bold text-gray-800">Vorschau - Vollbildansicht</h3>
            <button
              onClick={() => setShowFullscreenModal(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Schließen"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-grow">
            <iframe
              src={previewUrl}
              className="w-full h-full border-0"
              title="Event-Vorschau Vollbild"
            />
          </div>
        </div>
      )}
    </div>
  );
}
