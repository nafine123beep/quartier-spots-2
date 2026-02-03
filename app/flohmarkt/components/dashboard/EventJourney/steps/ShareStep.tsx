"use client";

import { useState } from "react";
import { useFlohmarkt } from "../../../../FlohmarktContext";
import { getPublicImageUrl } from "../../../../lib/imageUpload";
import { PrintMaterialsModal } from "../../PrintMaterialsModal";
import { LinkCopyField } from "../shared/LinkCopyField";
import { FileText, Share2, ChevronDown, ChevronRight, QrCode, Printer, AlertCircle } from "lucide-react";

interface ShareStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function ShareStep({ onNext, onBack }: ShareStepProps) {
  const { currentTenantEvent, currentTenant, user } = useFlohmarkt();
  const [isPrintMaterialsOpen, setIsPrintMaterialsOpen] = useState(false);
  const [showLinks, setShowLinks] = useState(false);

  if (!currentTenantEvent || !currentTenant) return null;

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const publicLink = `${baseUrl}/flohmarkt/${currentTenant.slug}/${currentTenantEvent.slug}`;
  const registrationLink = `${baseUrl}/flohmarkt/${currentTenant.slug}/${currentTenantEvent.slug}/register`;

  // Get cover image URL for PrintMaterialsModal
  const coverImageUrl = (() => {
    if (currentTenantEvent.images && currentTenantEvent.images.length > 0) {
      const coverImage =
        currentTenantEvent.images.find((img) => img.is_cover) ||
        currentTenantEvent.images[0];
      return getPublicImageUrl(coverImage.storage_path);
    }
    return undefined;
  })();

  const isDraft = currentTenantEvent.status === "draft";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-5">
        <h2 className="text-lg font-bold text-[#003366] mb-2 flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Event verbreiten
        </h2>
        <p className="text-gray-600">
          Teile dein Event mit Postern, Flyern oder Links. Der QR-Code auf den Druckmaterialien führt direkt zur Anmeldung.
        </p>
      </div>

      {/* Draft warning */}
      {isDraft && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-amber-800 font-medium">
                Event noch nicht veröffentlicht
              </p>
              <p className="text-sm text-amber-700 mt-1">
                Links und QR-Codes funktionieren erst nach der Veröffentlichung.
                Gehe zurück zu Schritt 3, um das Event zu veröffentlichen.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Primary: PDF/Poster creation */}
      <div className="bg-green-50 border-2 border-green-400 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="h-6 w-6 text-green-600" />
          </div>
          <div className="flex-grow">
            <h3 className="text-lg font-bold text-green-800 mb-2">
              Druckmaterialien erstellen
            </h3>
            <p className="text-green-700 mb-4">
              Erstelle Poster (A4) und Flyer (A6) mit QR-Code.
              Ideal zum Aufhängen im Quartier, an Laternen oder in Geschäften.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setIsPrintMaterialsOpen(true)}
                disabled={isDraft}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Printer className="h-5 w-5" />
                Poster & Flyer erstellen
              </button>
            </div>

            {/* Benefits */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-sm text-green-700">
                <QrCode className="h-4 w-4" />
                <span>QR-Code zur direkten Anmeldung</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-700">
                <FileText className="h-4 w-4" />
                <span>PDF zum Drucken und Teilen</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary: Direct links (collapsed) */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <button
          onClick={() => setShowLinks(!showLinks)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Share2 className="h-5 w-5 text-gray-500" />
            <div className="text-left">
              <span className="font-medium text-gray-700 block">
                Links direkt teilen
              </span>
              <span className="text-sm text-gray-500">
                Für WhatsApp, E-Mail oder Social Media
              </span>
            </div>
          </div>
          {showLinks ? (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-400" />
          )}
        </button>

        {showLinks && (
          <div className="border-t border-gray-200 p-4 space-y-3">
            <p className="text-sm text-gray-600 mb-4">
              Kopiere einen Link und teile ihn per WhatsApp, E-Mail oder in sozialen Medien.
            </p>

            <LinkCopyField
              label="Anmelde-Link"
              description="Führt direkt zur Spot-Anmeldung"
              url={registrationLink}
            />

            <LinkCopyField
              label="Event-Übersicht"
              description="Zeigt das gesamte Event mit Karte und Liste"
              url={publicLink}
            />

            {isDraft && (
              <p className="text-xs text-amber-600 mt-3">
                Diese Links funktionieren erst nach der Veröffentlichung.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">Tipps zum Verbreiten</h4>
        <ul className="space-y-2 text-sm text-blue-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            Hänge Poster an gut besuchten Orten auf: Supermärkte, Bäckereien, Cafés
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            Verteile Flyer in Briefkästen oder bei Nachbarn
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            Teile den Link in lokalen WhatsApp-Gruppen oder Nachbarschaftsnetzwerken
          </li>
        </ul>
      </div>

      {/* Print Materials Modal */}
      <PrintMaterialsModal
        isOpen={isPrintMaterialsOpen}
        onClose={() => setIsPrintMaterialsOpen(false)}
        event={currentTenantEvent}
        organizationSlug={currentTenant.slug}
        userEmail={user?.email}
        coverImageUrl={coverImageUrl}
        registrationUrl={`${baseUrl}/flohmarkt/${currentTenant.slug}/${currentTenantEvent.slug}?tab=form`}
      />
    </div>
  );
}
