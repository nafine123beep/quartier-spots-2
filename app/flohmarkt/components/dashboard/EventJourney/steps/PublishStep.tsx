"use client";

import { useState } from "react";
import { useFlohmarkt } from "../../../../FlohmarktContext";
import { Rocket, Check, Users, Search, Archive, Loader2, AlertTriangle, Globe } from "lucide-react";

interface PublishStepProps {
  onNext: () => void;
  onBack: () => void;
  onPublishSuccess: () => void;
}

export function PublishStep({ onNext, onBack, onPublishSuccess }: PublishStepProps) {
  const { currentTenantEvent, publishEvent, archiveEvent } = useFlohmarkt();
  const [isPublishing, setIsPublishing] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  if (!currentTenantEvent) return null;

  const isDraft = currentTenantEvent.status === "draft";
  const isPublished = currentTenantEvent.status === "published";
  const isArchived = currentTenantEvent.status === "archived";

  const handlePublish = async () => {
    setIsPublishing(true);
    const result = await publishEvent(currentTenantEvent.id);
    setIsPublishing(false);

    if (result.success) {
      onPublishSuccess();
    } else {
      alert(`Fehler beim Veröffentlichen: ${result.error}`);
    }
  };

  const handleArchive = async () => {
    setIsArchiving(true);
    const result = await archiveEvent(currentTenantEvent.id);
    setIsArchiving(false);
    setShowArchiveConfirm(false);

    if (result.success) {
      alert("Event wurde archiviert.");
    } else {
      alert(`Fehler beim Archivieren: ${result.error}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Draft state */}
      {isDraft && (
        <>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket className="h-8 w-8 text-gray-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Dein Event ist ein Entwurf
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Veröffentliche dein Event, damit Teilnehmer es finden und sich anmelden können.
              </p>
            </div>

            {/* What happens when published */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-gray-800 mb-3">Was passiert nach der Veröffentlichung?</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Globe className="h-3.5 w-3.5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-700 font-medium">Öffentlich sichtbar</p>
                    <p className="text-sm text-gray-500">Alle können dein Event über den Link oder QR-Code finden.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Users className="h-3.5 w-3.5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-700 font-medium">Anmeldungen möglich</p>
                    <p className="text-sm text-gray-500">Teilnehmer können ihre Spots eintragen.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Search className="h-3.5 w-3.5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-700 font-medium">Du behältst die Kontrolle</p>
                    <p className="text-sm text-gray-500">Du kannst jederzeit Änderungen vornehmen oder das Event archivieren.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Publish button */}
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-green-600 text-white rounded-lg font-bold text-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  Wird veröffentlicht...
                </>
              ) : (
                <>
                  <Rocket className="h-6 w-6" />
                  Event veröffentlichen
                </>
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              Noch nicht bereit? Du kannst jederzeit zurückgehen und Änderungen vornehmen.
            </p>
          </div>
        </>
      )}

      {/* Published state */}
      {isPublished && (
        <>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-green-700 mb-2">
                Dein Event ist veröffentlicht!
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Teilnehmer können dein Event jetzt finden und sich anmelden.
                Im nächsten Schritt kannst du es verbreiten.
              </p>
            </div>

            {/* What's happening now */}
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-green-800 mb-3">Was jetzt möglich ist:</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-green-700">
                  <Check className="h-4 w-4" />
                  Event ist für alle sichtbar
                </li>
                <li className="flex items-center gap-2 text-sm text-green-700">
                  <Check className="h-4 w-4" />
                  Anmeldungen werden angenommen
                </li>
                <li className="flex items-center gap-2 text-sm text-green-700">
                  <Check className="h-4 w-4" />
                  QR-Code und Links funktionieren
                </li>
              </ul>
            </div>

            {/* Next step button */}
            <button
              onClick={onNext}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#003366] text-white rounded-lg font-bold text-lg hover:bg-[#002244] transition-colors"
            >
              Weiter zu &quot;Verbreiten&quot;
            </button>
          </div>

          {/* Archive option */}
          <div className="bg-white rounded-lg shadow-sm p-5">
            <button
              onClick={() => setShowArchiveConfirm(true)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
            >
              <Archive className="h-4 w-4" />
              Event archivieren
            </button>
            <p className="text-xs text-gray-400 mt-1">
              Das Event wird dann nicht mehr öffentlich sichtbar sein.
            </p>
          </div>
        </>
      )}

      {/* Archived state */}
      {isArchived && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Archive className="h-8 w-8 text-yellow-600" />
            </div>
            <h2 className="text-xl font-bold text-yellow-700 mb-2">
              Event ist archiviert
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Dieses Event ist nicht mehr öffentlich sichtbar.
              Neue Anmeldungen sind nicht mehr möglich.
            </p>
          </div>
        </div>
      )}

      {/* Archive confirmation modal */}
      {showArchiveConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[4000] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Event archivieren?</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Das Event wird nicht mehr öffentlich sichtbar sein und keine neuen Anmeldungen mehr annehmen.
              Bestehende Daten bleiben erhalten.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowArchiveConfirm(false)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleArchive}
                disabled={isArchiving}
                className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 disabled:opacity-50 transition-colors"
              >
                {isArchiving ? "Wird archiviert..." : "Archivieren"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
