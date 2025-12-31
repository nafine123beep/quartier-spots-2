"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useFlohmarkt } from "../../FlohmarktContext";

export function EventControlPanel() {
  const { currentTenantEvent, currentTenant, setCurrentTenantEvent } = useFlohmarkt();
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);

  if (!currentTenantEvent || !currentTenant) return null;

  const eventIdentifier = currentTenantEvent.slug || currentTenantEvent.id;
  const publicLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/flohmarkt/${currentTenant.slug}/${eventIdentifier}`;
  const registrationLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/flohmarkt/${currentTenant.slug}/${eventIdentifier}/register`;

  // Preview link (only if token exists)
  const previewLink = currentTenantEvent.preview_token
    ? `${publicLink}?preview=${currentTenantEvent.preview_token}`
    : null;

  const generatePreviewToken = async () => {
    setIsGeneratingToken(true);
    const supabase = createClient();

    // Generate a new UUID token
    const newToken = crypto.randomUUID();

    const { error } = await supabase
      .from("events")
      .update({ preview_token: newToken })
      .eq("id", currentTenantEvent.id);

    if (error) {
      alert("Fehler beim Erstellen des Vorschau-Links: " + error.message);
    } else {
      // Update local state
      setCurrentTenantEvent({ ...currentTenantEvent, preview_token: newToken });
      alert("Vorschau-Link wurde erstellt!");
    }
    setIsGeneratingToken(false);
  };

  const revokePreviewToken = async () => {
    if (!confirm("Vorschau-Link wirklich deaktivieren? Bestehende Links funktionieren dann nicht mehr.")) return;

    const supabase = createClient();

    const { error } = await supabase
      .from("events")
      .update({ preview_token: null })
      .eq("id", currentTenantEvent.id);

    if (error) {
      alert("Fehler: " + error.message);
    } else {
      // Update local state
      setCurrentTenantEvent({ ...currentTenantEvent, preview_token: null });
      alert("Vorschau-Link wurde deaktiviert!");
    }
  };

  const copyPreviewLink = () => {
    if (!previewLink) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(previewLink).then(() => {
        alert("Vorschau-Link kopiert!");
      });
    } else {
      alert("Kopieren nicht unterstützt, bitte manuell markieren.");
    }
  };

  const copyRegistrationLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(registrationLink).then(() => {
        alert("Anmelde-Link kopiert!");
      });
    } else {
      alert("Kopieren nicht unterstützt, bitte manuell markieren.");
    }
  };

  const copyPublicLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(publicLink).then(() => {
        alert("Link kopiert!");
      });
    } else {
      alert("Kopieren nicht unterstützt, bitte manuell markieren.");
    }
  };

  const goToPublicView = () => {
    window.open(publicLink, '_blank');
  };

  const goToRegistrationPage = () => {
    window.open(registrationLink, '_blank');
  };

  return (
    <div className="bg-white border border-gray-200 border-l-4 border-l-green-500 p-5 rounded-lg">
      <h3 className="mt-0 text-green-700 font-bold">
        Links für Teilnehmer
      </h3>

      {/* Preview Link Section - Only for draft events */}
      {currentTenantEvent.status === 'draft' && (
        <div className="mb-5 p-4 bg-purple-50 border-2 border-purple-400 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">👁️</span>
            <h4 className="m-0 text-purple-800 font-bold">Vorschau-Link (Entwurf)</h4>
          </div>
          <p className="text-sm text-gray-700 mb-3 mt-2">
            Teile diesen Link, um anderen eine Vorschau deines unveröffentlichten Events zu zeigen.
          </p>

          {previewLink ? (
            <>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="flex-grow bg-white p-2.5 border border-purple-300 rounded font-mono break-all text-sm text-gray-900">
                  {previewLink}
                </div>
                <button
                  onClick={copyPreviewLink}
                  title="Vorschau-Link kopieren"
                  className="bg-purple-500 hover:bg-purple-600 text-white border-none p-2.5 rounded cursor-pointer text-xl transition-colors"
                >
                  📋
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.open(previewLink, '_blank')}
                  className="flex-1 bg-purple-600 text-white px-5 py-3 rounded-md font-bold cursor-pointer hover:bg-purple-700 transition-colors"
                >
                  👁️ Vorschau öffnen
                </button>
                <button
                  onClick={revokePreviewToken}
                  className="bg-red-100 text-red-700 px-4 py-3 rounded-md font-bold cursor-pointer hover:bg-red-200 transition-colors"
                >
                  Deaktivieren
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={generatePreviewToken}
              disabled={isGeneratingToken}
              className="w-full bg-purple-600 text-white px-5 py-3 rounded-md font-bold cursor-pointer hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingToken ? 'Wird erstellt...' : 'Vorschau-Link erstellen'}
            </button>
          )}
        </div>
      )}

      {/* Registration Link - Primary/Prominent */}
      <div className="mb-5 p-4 bg-green-50 border-2 border-green-400 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">✨</span>
          <h4 className="m-0 text-green-800 font-bold">Spot-Anmeldung (Empfohlen)</h4>
        </div>
        <p className="text-sm text-gray-700 mb-3 mt-2">
          Direkter Link zur Spot-Anmeldung. Ideal zum Teilen in Flyern, E-Mails oder Social Media.
        </p>

        <div className="flex items-center gap-2.5 mb-3">
          <div className="flex-grow bg-white p-2.5 border border-green-300 rounded font-mono break-all text-sm text-gray-900">
            {registrationLink}
          </div>
          <button
            onClick={copyRegistrationLink}
            title="Anmelde-Link kopieren"
            className="bg-green-500 hover:bg-green-600 text-white border-none p-2.5 rounded cursor-pointer text-xl transition-colors"
          >
            📋
          </button>
        </div>

        <button
          onClick={goToRegistrationPage}
          className="w-full bg-green-600 text-white px-5 py-3 rounded-md font-bold cursor-pointer hover:bg-green-700 transition-colors"
        >
          🔗 Anmelde-Seite öffnen
        </button>
      </div>

      {/* Public Event Link - Secondary */}
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="m-0 mb-2 text-gray-700 font-semibold text-sm">Event-Übersicht</h4>
        <p className="text-xs text-gray-600 mb-3">
          Link zur vollständigen Event-Ansicht mit Liste, Karte und Anmeldung.
        </p>

        <div className="flex items-center gap-2.5 mb-2">
          <div className="flex-grow bg-white p-2 border border-gray-300 rounded font-mono break-all text-xs text-gray-900">
            {publicLink}
          </div>
          <button
            onClick={copyPublicLink}
            title="Link kopieren"
            className="bg-gray-200 border border-gray-300 p-2 rounded cursor-pointer text-lg hover:bg-gray-300"
          >
            📋
          </button>
        </div>

        <button
          onClick={goToPublicView}
          className="w-full bg-[#FFCC00] text-[#003366] px-4 py-2 rounded-md font-medium cursor-pointer hover:bg-[#e6b800] text-sm"
        >
          Zur Besucher-Ansicht
        </button>
      </div>
    </div>
  );
}
