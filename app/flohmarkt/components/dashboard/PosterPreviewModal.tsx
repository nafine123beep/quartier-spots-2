"use client";

import { useState, useEffect } from "react";
import { TenantEvent } from "../../types";
import { DEFAULT_POSTER_DESCRIPTION, MIN_DESCRIPTION_LENGTH } from "../pdf/posterStyles";

interface PosterPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: TenantEvent;
  userEmail?: string;
  onGenerate: (customDescription: string, contactEmail: string) => Promise<void>;
}

export function PosterPreviewModal({
  isOpen,
  onClose,
  event,
  userEmail,
  onGenerate,
}: PosterPreviewModalProps) {
  const [description, setDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize description and email when modal opens
  useEffect(() => {
    if (isOpen) {
      // Use event description if available and long enough, otherwise use fallback
      const initialDescription =
        event.description && event.description.trim().length >= MIN_DESCRIPTION_LENGTH
          ? event.description.trim()
          : DEFAULT_POSTER_DESCRIPTION;
      setDescription(initialDescription);

      // Pre-fill with user's email
      setContactEmail(userEmail || "");
    }
  }, [isOpen, event.description, userEmail]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await onGenerate(description, contactEmail.trim());
      onClose();
    } catch (error) {
      console.error("Poster generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const isUsingFallback =
    !event.description || event.description.trim().length < MIN_DESCRIPTION_LENGTH;

  return (
    <div className="fixed inset-0 bg-black/50 z-[4000] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#003366]">Poster-Vorschau</h2>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none disabled:opacity-50"
            aria-label="Schließen"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Event Info (read-only preview) */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div>
              <h3 className="text-lg font-bold text-[#003366]">{event.title}</h3>
            </div>
            {event.starts_at && (
              <div className="text-sm text-gray-600">
                <strong>Datum:</strong>{" "}
                {new Date(event.starts_at).toLocaleDateString("de-DE", {
                  weekday: "long",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
                {event.ends_at && (
                  <>
                    {" | "}
                    {new Date(event.starts_at).toLocaleTimeString("de-DE", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    –{" "}
                    {new Date(event.ends_at).toLocaleTimeString("de-DE", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    Uhr
                  </>
                )}
              </div>
            )}
            {event.map_center_address && (
              <div className="text-sm text-gray-600">
                <strong>Standort:</strong> {event.map_center_address}
              </div>
            )}
          </div>

          {/* Editable Contact Email */}
          <div>
            <label htmlFor="poster-contact-email" className="block mb-2">
              <span className="font-semibold text-gray-700">Kontakt-E-Mail (optional)</span>
            </label>
            <input
              id="poster-contact-email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent"
              placeholder="ihre@email.de"
            />
            <p className="text-xs text-gray-500 mt-1">
              Diese E-Mail erscheint im Kontakt-Block auf dem Poster. Leer lassen, um keinen Kontakt anzuzeigen.
            </p>
          </div>

          {/* Editable Description */}
          <div>
            <label htmlFor="poster-description" className="block mb-2">
              <span className="font-semibold text-gray-700">Beschreibungstext für das Poster</span>
              {isUsingFallback && (
                <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                  Standard-Text (Event hat keine Beschreibung)
                </span>
              )}
            </label>
            <textarea
              id="poster-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent resize-none"
              placeholder="Beschreibung für das Poster..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Dieser Text erscheint nur auf diesem Poster und ändert nicht die Event-Beschreibung.
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            <p className="font-semibold mb-1">📋 Das Poster enthält:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Titel, Datum und Standort</li>
              <li>
                {event.images && event.images.length > 0
                  ? "Event-Bild (Titelbild)"
                  : "Kein Bild (Event hat kein Titelbild)"}
              </li>
              <li>Beschreibungstext (editierbar)</li>
              {contactEmail && <li>Kontakt-Block mit E-Mail</li>}
              <li>QR-Code zur Anmeldung (keine Anmeldung nötig)</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="px-4 py-2 border-2 border-gray-400 text-gray-700 rounded-md font-medium hover:bg-gray-100 hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Abbrechen
          </button>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || description.trim().length < MIN_DESCRIPTION_LENGTH}
            className="bg-[#003366] text-white px-4 py-2 rounded-md font-bold hover:bg-[#002244] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? "⏳ Poster wird erstellt..." : "📋 Poster erstellen"}
          </button>
        </div>
      </div>
    </div>
  );
}
