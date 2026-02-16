"use client";

import { useState } from "react";
import { useFlohmarkt } from "../../../../FlohmarktContext";
import { getSpotTerms } from "../../../../lib/spotTerms";
import { LinkCopyField } from "../shared/LinkCopyField";
import { AdminSpotTable } from "../../AdminSpotTable";
import { HighlightManagementPanel } from "../../HighlightManagementPanel";
import { PendingDeletionRequests } from "../../PendingDeletionRequests";
import { PrintViewModal } from "../../PrintView";
import { Settings, MapPin, Star, Trash2, FileText, Archive } from "lucide-react";

interface ManageStepProps {
  onBack: () => void;
}

type ManageTab = "spots" | "highlights" | "deletion-requests";

export function ManageStep(_props: ManageStepProps) {
  const { currentTenantEvent, currentTenant, spots, deletionRequests, isAdmin, archiveEvent } = useFlohmarkt();
  const [activeTab, setActiveTab] = useState<ManageTab>("spots");
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  if (!currentTenantEvent || !currentTenant) return null;

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const eventUrl = `${baseUrl}/flohmarkt/${currentTenant.slug}/${currentTenantEvent.slug}`;

  const terms = getSpotTerms(
    currentTenantEvent.spot_term_singular,
    currentTenantEvent.spot_term_plural
  );

  // Count pending deletion requests
  const pendingCount = deletionRequests?.filter((r) => r.status === "pending").length || 0;

  const tabs: { id: ManageTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: "spots",
      label: terms.plural,
      icon: <MapPin className="h-4 w-4" />,
      badge: spots?.length || 0,
    },
    {
      id: "highlights",
      label: "Highlights",
      icon: <Star className="h-4 w-4" />,
    },
    {
      id: "deletion-requests",
      label: "Löschanfragen",
      icon: <Trash2 className="h-4 w-4" />,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
  ];

  const handleArchive = async () => {
    if (!currentTenantEvent) return;

    setIsArchiving(true);
    const result = await archiveEvent(currentTenantEvent.id);
    setIsArchiving(false);

    if (result.success) {
      setShowArchiveDialog(false);
      // Redirect to organization page after archiving
      window.location.href = `/flohmarkt/organizations/${currentTenant?.slug}/events`;
    } else {
      alert(`Fehler beim Archivieren: ${result.error}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#003366] mb-2 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Anmeldungen verwalten
            </h2>
            <p className="text-gray-600">
              Verwalte Stände, setze Highlights und bearbeite Löschanfragen.
            </p>
            <p className="text-gray-600 mt-1">
              Setze wichtige Infrastrukturpunkte wie Registrierung, Toiletten, Info-Points, etc.
            </p>
          </div>
          <div className="flex gap-2">
            {/* Archive button - only for admins and active events */}
            {isAdmin && currentTenantEvent?.status === 'active' && (
              <button
                onClick={() => setShowArchiveDialog(true)}
                className="flex items-center gap-2 px-4 py-2 border-2 border-orange-400 text-orange-600 rounded-lg font-medium hover:bg-orange-50 transition-colors text-sm"
                title="Event archivieren"
              >
                <Archive className="h-4 w-4" />
                <span className="hidden sm:inline">Archivieren</span>
              </button>
            )}

            {/* PDF button */}
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#003366] text-white rounded-lg font-medium hover:bg-[#002244] transition-colors text-sm"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">PDF-Liste erstellen</span>
              <span className="sm:hidden">PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Besucher-Ansicht link */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <LinkCopyField
          label="Besucher-Ansicht"
          description="Link zur öffentlichen Event-Seite für alle Teilnehmer"
          url={eventUrl}
        />
      </div>

      {/* Tab navigation */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                aria-selected={activeTab === tab.id}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium
                  border-b-2 transition-colors
                  ${activeTab === tab.id
                    ? "border-[#003366] text-[#003366] bg-blue-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }
                `}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`
                      ml-1 px-2 py-0.5 rounded-full text-xs font-medium
                      ${tab.id === "deletion-requests" && tab.badge > 0
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-600"
                      }
                    `}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        <div className="p-4 sm:p-5">
          {activeTab === "spots" && <AdminSpotTable />}
          {activeTab === "highlights" && <HighlightManagementPanel />}
          {activeTab === "deletion-requests" && (
            <>
              <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                Teilnehmer können die Löschung ihres Stands beantragen. Offene Anfragen müssen von dir bestätigt oder abgelehnt werden.
              </div>
              <PendingDeletionRequests />
            </>
          )}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-[#003366]">{spots?.length || 0}</p>
          <p className="text-sm text-gray-600">{terms.plural}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">
            {spots?.filter((s) => s.is_highlight).length || 0}
          </p>
          <p className="text-sm text-gray-600">Highlights</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <p className={`text-2xl font-bold ${pendingCount > 0 ? "text-red-600" : "text-gray-600"}`}>
            {pendingCount}
          </p>
          <p className="text-sm text-gray-600">Offene Löschanfragen</p>
        </div>
      </div>

      {/* Print View Modal */}
      <PrintViewModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />

      {/* Archive Confirmation Dialog */}
      {showArchiveDialog && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Event archivieren?
            </h3>
            <p className="text-gray-600 mb-6">
              Das Event wird archiviert und ist nicht mehr öffentlich sichtbar.
              Diese Aktion kann nicht rückgängig gemacht werden.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowArchiveDialog(false)}
                disabled={isArchiving}
                className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Abbrechen
              </button>
              <button
                onClick={handleArchive}
                disabled={isArchiving}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50"
              >
                {isArchiving ? 'Archiviere...' : 'Archivieren'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
