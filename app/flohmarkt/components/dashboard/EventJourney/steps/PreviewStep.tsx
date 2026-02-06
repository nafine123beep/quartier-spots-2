"use client";

import { useState } from "react";
import { useFlohmarkt } from "../../../../FlohmarktContext";
import { PublicEventView } from "../../../event/PublicEventView";
import { Eye, Maximize2, X } from "lucide-react";

interface PreviewStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function PreviewStep({ onNext, onBack }: PreviewStepProps) {
  const { currentTenantEvent, currentTenant, isAdmin } = useFlohmarkt();
  const [showFullscreenModal, setShowFullscreenModal] = useState(false);

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
          <PublicEventView
            accessMode={isAdmin ? 'member' : 'public'}
            embedded={true}
          />
        </div>
      </div>

      {/* Fullscreen modal */}
      {showFullscreenModal && (
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
            <PublicEventView
              accessMode={isAdmin ? 'member' : 'public'}
              embedded={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}