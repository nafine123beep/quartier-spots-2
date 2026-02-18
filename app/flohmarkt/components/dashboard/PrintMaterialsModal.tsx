"use client";

import { useState, useEffect } from "react";
import { FileText, Image as ImageIcon, MapPin, Calendar, ArrowLeft, ArrowRight, Info, Loader2 } from "lucide-react";
import { TenantEvent } from "../../types";
import { DEFAULT_POSTER_DESCRIPTION, MIN_DESCRIPTION_LENGTH } from "../pdf/posterStyles";
import { generatePosterPDF } from "../pdf/PosterPDFGenerator";
import { generateFlyerPDF } from "../pdf/FlyerPDFGenerator";

interface PrintMaterialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: TenantEvent;
  organizationSlug: string;
  userEmail?: string;
  coverImageUrl?: string;
  registrationUrl: string;
}

type ModalStep = 'edit' | 'preview';
type GeneratingFormat = 'none' | 'a4' | 'a6';

export function PrintMaterialsModal({
  isOpen,
  onClose,
  event,
  organizationSlug,
  userEmail,
  coverImageUrl,
  registrationUrl,
}: PrintMaterialsModalProps) {
  const [step, setStep] = useState<ModalStep>('edit');
  const [description, setDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [generating, setGenerating] = useState<GeneratingFormat>('none');

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

      // Reset to edit step when reopening
      setStep('edit');
    }
  }, [isOpen, event.description, userEmail]);

  if (!isOpen) return null;

  const handleNextStep = () => {
    setStep('preview');
  };

  const handleBackStep = () => {
    setStep('edit');
  };

  const handleClose = () => {
    if (generating === 'none') {
      onClose();
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadA4 = async () => {
    setGenerating('a4');
    try {
      const blob = await generatePosterPDF({
        event,
        organizationSlug,
        coverImageUrl,
        registrationUrl,
        contactEmail: contactEmail.trim() || undefined,
        customDescription: description,
      });
      downloadBlob(blob, `${event.slug}-poster-a4.pdf`);
    } catch (error) {
      console.error("A4 poster generation failed:", error);
      alert("Fehler beim Erstellen des A4-Posters. Bitte versuchen Sie es erneut.");
    } finally {
      setGenerating('none');
    }
  };

  const handleDownloadA6 = async () => {
    setGenerating('a6');
    try {
      const blob = await generateFlyerPDF({
        event,
        coverImageUrl,
        registrationUrl,
        contactEmail: contactEmail.trim() || undefined,
        customDescription: description,
      });
      downloadBlob(blob, `${event.slug}-flyer-a6.pdf`);
    } catch (error) {
      console.error("A6 flyer generation failed:", error);
      alert("Fehler beim Erstellen des A6-Flyers. Bitte versuchen Sie es erneut.");
    } finally {
      setGenerating('none');
    }
  };

  const isDescriptionValid = description.trim().length >= MIN_DESCRIPTION_LENGTH;
  const isUsingFallback =
    !event.description || event.description.trim().length < MIN_DESCRIPTION_LENGTH;

  return (
    <div className="fixed inset-0 bg-black/50 z-[4000] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-[#003366]">Poster & Flyer erstellen</h2>
            <p className="text-sm text-gray-600 mt-1">
              {step === 'edit' ? 'Schritt 1 von 2: Inhalte bearbeiten' : 'Schritt 2 von 2: Format auswählen & herunterladen'}
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={generating !== 'none'}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none disabled:opacity-50"
            aria-label="Schließen"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {step === 'edit' ? (
            // Step 1: Content Editor
            <div className="space-y-4 max-w-3xl mx-auto">
              {/* Event Info Preview (read-only) */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div>
                  <h3 className="text-lg font-bold text-[#003366]">{event.title}</h3>
                </div>
                {event.starts_at && (
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
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
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <strong>Standort:</strong> {event.map_center_address}
                  </div>
                )}
                {coverImageUrl && (
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    <span>Event-Bild vorhanden</span>
                  </div>
                )}
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <p className="font-semibold mb-1 flex items-center gap-1"><Info className="h-4 w-4" aria-hidden="true" /> Diese Angaben werden für beide Formate verwendet</p>
                <p>Bearbeite die Beschreibung und E-Mail einmalig. Sie erscheinen dann auf beiden Druckmaterialien.</p>
              </div>

              {/* Editable Description */}
              <div>
                <label htmlFor="print-description" className="block mb-2">
                  <span className="font-semibold text-gray-700">Beschreibungstext</span>
                  {isUsingFallback && (
                    <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                      Standard-Text (Event hat keine Beschreibung)
                    </span>
                  )}
                </label>
                <textarea
                  id="print-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent resize-none"
                  placeholder="Beschreibung für Poster und Flyer..."
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">
                    Mindestens {MIN_DESCRIPTION_LENGTH} Zeichen erforderlich
                  </p>
                  <p className="text-xs text-gray-500">
                    {description.length} Zeichen
                  </p>
                </div>
              </div>

              {/* Editable Contact Email */}
              <div>
                <label htmlFor="print-contact-email" className="block mb-2">
                  <span className="font-semibold text-gray-700">Kontakt-E-Mail (optional)</span>
                </label>
                <input
                  id="print-contact-email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                  placeholder="ihre@email.de"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Diese E-Mail erscheint auf beiden Druckmaterialien. Leer lassen, um keinen Kontakt anzuzeigen.
                </p>
              </div>
            </div>
          ) : (
            // Step 2: Format Selection & Preview
            <div className="space-y-4">
              <p className="text-center text-gray-600 mb-6">
                Wähle ein Format aus und lade es herunter. Du kannst auch beide herunterladen.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* A4 Poster Preview Card */}
                <div className="border-2 border-gray-300 rounded-lg p-4 space-y-3">
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-[#003366]">A4 Poster</h3>
                    <p className="text-sm text-gray-600">210 × 297 mm</p>
                  </div>

                  {/* Preview Mockup */}
                  <div className="bg-gray-100 rounded-md p-4 min-h-[300px] flex flex-col items-center justify-center">
                    <FileText className="h-16 w-16 text-[#003366] mb-3" />
                    <p className="text-sm text-gray-700 text-center mb-2">
                      <strong>Für Aushänge & Schaufenster</strong>
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>✓ Große Schrift (lesbar von 1–2 Meter)</li>
                      <li>✓ Vollständiger Text ({description.length} Zeichen)</li>
                      <li>✓ QR-Code zur Anmeldung</li>
                      {coverImageUrl && <li>✓ Event-Bild</li>}
                      {contactEmail && <li>✓ Kontakt-Block</li>}
                    </ul>
                  </div>

                  {/* Download Button */}
                  <button
                    onClick={handleDownloadA4}
                    disabled={generating !== 'none' || !isDescriptionValid}
                    className="w-full bg-[#003366] text-white px-4 py-3 rounded-md font-bold hover:bg-[#002244] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {generating === 'a4' ? (
                      <><Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Wird erstellt...</>
                    ) : (
                      <>
                        <FileText className="h-5 w-5" />
                        A4 Poster herunterladen
                      </>
                    )}
                  </button>
                </div>

                {/* A6 Flyer Preview Card */}
                <div className="border-2 border-gray-300 rounded-lg p-4 space-y-3">
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-[#003366]">A6 Flyer</h3>
                    <p className="text-sm text-gray-600">148 × 105 mm</p>
                  </div>

                  {/* Preview Mockup */}
                  <div className="bg-gray-100 rounded-md p-4 min-h-[300px] flex flex-col items-center justify-center">
                    <FileText className="h-12 w-12 text-[#003366] mb-3" />
                    <p className="text-sm text-gray-700 text-center mb-2">
                      <strong>Kompakt für Handzettel</strong>
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>✓ Dominanter Titel (24pt)</li>
                      <li>✓ Vollständiger Text (keine Kürzung)</li>
                      <li>✓ QR-Code im hervorgehobenen Block</li>
                      {coverImageUrl && <li>✓ Banner-Bild</li>}
                      {contactEmail && <li>✓ Kontakt im Footer</li>}
                    </ul>
                  </div>

                  {/* Download Button */}
                  <button
                    onClick={handleDownloadA6}
                    disabled={generating !== 'none' || !isDescriptionValid}
                    className="w-full bg-[#003366] text-white px-4 py-3 rounded-md font-bold hover:bg-[#002244] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {generating === 'a6' ? (
                      <><Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Wird erstellt...</>
                    ) : (
                      <>
                        <FileText className="h-5 w-5" />
                        A6 Flyer herunterladen
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-between items-center">
          {step === 'edit' ? (
            <>
              <button
                onClick={handleClose}
                disabled={generating !== 'none'}
                className="px-4 py-2 border-2 border-gray-400 text-gray-700 rounded-md font-medium hover:bg-gray-100 hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Abbrechen
              </button>
              <button
                onClick={handleNextStep}
                disabled={!isDescriptionValid}
                className="bg-[#003366] text-white px-6 py-2 rounded-md font-bold hover:bg-[#002244] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Weiter zur Formatauswahl <ArrowRight className="h-4 w-4 inline ml-1" aria-hidden="true" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleBackStep}
                disabled={generating !== 'none'}
                className="px-4 py-2 border-2 border-gray-400 text-gray-700 rounded-md font-medium hover:bg-gray-100 hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="h-4 w-4 inline mr-1" aria-hidden="true" /> Zurück zur Bearbeitung
              </button>
              <button
                onClick={handleClose}
                disabled={generating !== 'none'}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Fertig
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
