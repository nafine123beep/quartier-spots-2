"use client";

import { useState } from "react";
import { useFlohmarkt } from "../../../../FlohmarktContext";
import { getPublicImageUrl } from "../../../../lib/imageUpload";
import { PrintMaterialsModal } from "../../PrintMaterialsModal";
import { LinkCopyField } from "../shared/LinkCopyField";
import { Share2, Printer } from "lucide-react";

interface ShareStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function ShareStep({ onNext, onBack }: ShareStepProps) {
  const { currentTenantEvent, currentTenant, user } = useFlohmarkt();
  const [isPrintMaterialsOpen, setIsPrintMaterialsOpen] = useState(false);

  if (!currentTenantEvent || !currentTenant) return null;

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-5">
        <h2 className="text-lg font-bold text-[#003366] mb-2 flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Teilnehmer einladen
        </h2>
        <p className="text-gray-600">
          Teile den Anmelde-Link oder erstelle Druckmaterialien mit QR-Code.
        </p>
      </div>

      {/* Primary: Registration link */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <LinkCopyField
          label="Anmelde-Link"
          description="Für WhatsApp, E-Mail oder Social Media"
          url={registrationLink}
        />
      </div>

      {/* Secondary: PDF/Poster creation */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-medium text-gray-700">Druckmaterialien</h3>
            <p className="text-sm text-gray-500">Poster (A4) und Flyer (A6) mit QR-Code</p>
          </div>
          <button
            onClick={() => setIsPrintMaterialsOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#003366] text-white rounded-lg font-medium text-sm hover:bg-[#002244] transition-colors whitespace-nowrap"
          >
            <Printer className="h-4 w-4" />
            Erstellen
          </button>
        </div>
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
