"use client";

import { useState, useEffect } from "react";
import { useFlohmarkt } from "../../../../FlohmarktContext";
import { createClient } from "@/lib/supabase/client";
import { Eye, Maximize2, X, Loader2, AlertCircle } from "lucide-react";

interface PreviewStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function PreviewStep({ onNext, onBack }: PreviewStepProps) {
  const { currentTenantEvent, currentTenant, setCurrentTenantEvent } = useFlohmarkt();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [showFullscreenModal, setShowFullscreenModal] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    if (!currentTenantEvent || !currentTenant) return;

    const baseUrl = window.location.origin;
    const eventUrl = `${baseUrl}/flohmarkt/${currentTenant.slug}/${currentTenantEvent.slug}`;

    if (currentTenantEvent.status === "draft") {
      // Draft events need preview token
      if (currentTenantEvent.preview_token) {
        setPreviewUrl(`${eventUrl}?preview=${currentTenantEvent.preview_token}&embedded=true`);
      } else {
        setPreviewUrl(null);
      }
    } else {
      // Published events can be viewed directly
      setPreviewUrl(`${eventUrl}?embedded=true`);
    }
  }, [currentTenantEvent, currentTenant]);

  const generatePreviewToken = async () => {
    if (!currentTenantEvent) return;

    setIsGeneratingToken(true);
    const supabase = createClient();
    const newToken = crypto.randomUUID();

    const { error } = await supabase
      .from("events")
      .update({ preview_token: newToken })
      .eq("id", currentTenantEvent.id);

    if (error) {
      alert("Fehler beim Erstellen der Vorschau: " + error.message);
    } else {
      setCurrentTenantEvent({ ...currentTenantEvent, preview_token: newToken });
    }
    setIsGeneratingToken(false);
  };

  if (!currentTenantEvent || !currentTenant) return null;

  const isDraft = currentTenantEvent.status === "draft";
  const needsToken = isDraft && !currentTenantEvent.preview_token;

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
        {needsToken ? (
          // Need to generate token first
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Vorschau aktivieren
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Da dein Event noch ein Entwurf ist, muss eine sichere Vorschau erstellt werden.
            </p>
            <button
              onClick={generatePreviewToken}
              disabled={isGeneratingToken}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {isGeneratingToken ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Wird erstellt...
                </>
              ) : (
                <>
                  <Eye className="h-5 w-5" />
                  Vorschau erstellen
                </>
              )}
            </button>
          </div>
        ) : previewUrl ? (
          // Show iframe preview
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
          // Error state
          <div className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Vorschau konnte nicht geladen werden.</p>
          </div>
        )}
      </div>

      {/* Info box for draft */}
      {isDraft && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-amber-800 font-medium">
                Dein Event ist noch nicht veröffentlicht
              </p>
              <p className="text-sm text-amber-700 mt-1">
                Nur du und Personen mit dem Vorschau-Link können es sehen.
                Veröffentliche das Event im nächsten Schritt, damit alle es finden können.
              </p>
            </div>
          </div>
        </div>
      )}

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
