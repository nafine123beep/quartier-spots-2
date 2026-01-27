"use client";

import { useEffect } from "react";
import { TenantEvent } from "../../types";
import { getSpotTerms } from "../../lib/spotTerms";
import { AccessMode } from "../../lib/loadEventData";

interface RegistrationInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: TenantEvent;
  accessMode?: AccessMode;
}

export function RegistrationInfoModal({ isOpen, onClose, event, accessMode = 'public' }: RegistrationInfoModalProps) {
  const terms = getSpotTerms(event?.spot_term_singular, event?.spot_term_plural);

  // Auto-close after 5 seconds
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [isOpen, onClose]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal Overlay */}
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9998] p-4 overflow-y-auto">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Main Content */}
          <div className="p-6 sm:p-8 relative">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-4xl leading-none transition-colors"
              aria-label="Schließen"
            >
              ×
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="flex flex-col items-center gap-2 mb-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#003366] m-0">
                  Am {event.title} teilnehmen
                </h1>
                {/* Draft Badge */}
                {event.status === 'draft' && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                    accessMode === 'preview'
                      ? 'bg-purple-500 text-white border-2 border-purple-600'
                      : 'bg-yellow-500 text-gray-900 border-2 border-yellow-600'
                  }`}>
                    <span className="mr-1">{accessMode === 'preview' ? '👁️' : '📝'}</span>
                    {accessMode === 'preview' ? 'VORSCHAU' : 'ENTWURF'}
                  </span>
                )}
              </div>
              <p className="text-base text-gray-600">
                {terms.enterYourSpot}
              </p>
            </div>

            {/* Event Details */}
            <div className="space-y-4 mb-6">
              {/* Description */}
              {event.description && (
                <div>
                  <h2 className="text-lg font-bold text-[#003366] mb-2">Über das Event</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {event.description}
                  </p>
                </div>
              )}

              {/* Date and Time */}
              {(event.starts_at || event.ends_at) && (
                <div>
                  <h2 className="text-lg font-bold text-[#003366] mb-2">Wann</h2>
                  <div className="text-gray-700 space-y-1">
                    {event.starts_at && (
                      <p className="flex items-center gap-2 m-0">
                        <span className="font-medium">Start:</span>
                        <span>{formatDate(event.starts_at)}</span>
                      </p>
                    )}
                    {event.ends_at && (
                      <p className="flex items-center gap-2 m-0">
                        <span className="font-medium">Ende:</span>
                        <span>{formatDate(event.ends_at)}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Location */}
              {event.map_center_address && (
                <div>
                  <h2 className="text-lg font-bold text-[#003366] mb-2">Wo</h2>
                  <div className="text-gray-700">
                    <p className="flex items-center gap-2 m-0">
                      <span>📍</span>
                      <span>{event.map_center_address}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="mb-4">
              <button
                onClick={onClose}
                className="w-full bg-[#003366] text-white px-6 py-4 rounded-lg text-lg font-bold hover:bg-[#002244] transition-colors shadow-md"
              >
                {terms.registerSpot}
              </button>
            </div>

            {/* Info Footer */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 m-0">
                Keine Anmeldung erforderlich • Kostenlos
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Das Formular öffnet sich automatisch...
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
