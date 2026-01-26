"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface EventCreatedNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
  eventSlug: string;
  tenantSlug: string;
}

export function EventCreatedNotification({
  isOpen,
  onClose,
  eventId,
  eventTitle,
  eventSlug,
  tenantSlug,
}: EventCreatedNotificationProps) {
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);

  if (!isOpen) return null;

  const handleGoToEvent = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsGeneratingToken(true);

    try {
      const supabase = createClient();

      // Generate a new UUID token
      const newToken = crypto.randomUUID();

      const { error } = await supabase
        .from("events")
        .update({ preview_token: newToken })
        .eq("id", eventId);

      if (error) {
        console.error("Error generating preview token:", error);
        // Still navigate to event even if token generation fails
        window.location.href = `/flohmarkt/${tenantSlug}/${eventSlug}/dashboard`;
        return;
      }

      // Navigate to preview URL
      const previewUrl = `/flohmarkt/${tenantSlug}/${eventSlug}?preview=${newToken}`;
      window.location.href = previewUrl;
    } catch (error) {
      console.error("Error:", error);
      // Fallback to dashboard
      window.location.href = `/flohmarkt/${tenantSlug}/${eventSlug}/dashboard`;
    } finally {
      setIsGeneratingToken(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#003366] text-white p-5 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold m-0">Event erstellt!</h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              aria-label="Schließen"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-[#003366]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* Event Title */}
          <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">
            &quot;{eventTitle}&quot;
          </h3>

          {/* Main Message */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-bold text-gray-800 mb-2">
                  Jetzt veröffentlichen und sichtbar machen
                </p>
                <p className="text-sm text-gray-700 mb-0">
                  Dein Event existiert nur im Vorschaumodus. Damit Teilnehmer es finden und sich anmelden können, musst du es noch veröffentlichen.
                </p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mb-4">
            <p className="text-sm font-bold text-gray-700 mb-2">Nächste Schritte:</p>
            <ul className="text-sm text-gray-700 space-y-1 pl-5 list-disc">
              <li>Prüfe und vervollständige die Event-Details</li>
              <li>Füge optional Fotos hinzu</li>
              <li>Klicke auf &quot;Event veröffentlichen&quot;</li>
            </ul>
          </div>

          {/* Video Guide */}
          <div className="mb-4 rounded-lg overflow-hidden border border-gray-200">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full"
            >
              <source src="/videos/screen-flow-event-creation.mp4" type="video/mp4" />
              Dein Browser unterstützt keine Video-Wiedergabe.
            </video>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isGeneratingToken}
              className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-md font-bold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Später
            </button>
            <button
              onClick={handleGoToEvent}
              disabled={isGeneratingToken}
              className="flex-1 bg-[#003366] text-white px-4 py-3 rounded-md font-bold hover:bg-[#002244] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingToken ? "Lade..." : "Zum Event"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
