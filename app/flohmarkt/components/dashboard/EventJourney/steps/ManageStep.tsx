"use client";

import { useState } from "react";
import { useFlohmarkt } from "../../../../FlohmarktContext";
import { getSpotTerms } from "../../../../lib/spotTerms";
import { AdminSpotTable } from "../../AdminSpotTable";
import { HighlightManagementPanel } from "../../HighlightManagementPanel";
import { PendingDeletionRequests } from "../../PendingDeletionRequests";
import { PrintViewModal } from "../../PrintView";
import { Settings, MapPin, Star, Trash2, FileText, Loader2 } from "lucide-react";

interface ManageStepProps {
  onBack: () => void;
}

type ManageTab = "spots" | "highlights" | "deletion-requests";

export function ManageStep({ onBack }: ManageStepProps) {
  const { currentTenantEvent, spots, deletionRequests } = useFlohmarkt();
  const [activeTab, setActiveTab] = useState<ManageTab>("spots");
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  if (!currentTenantEvent) return null;

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
              Verwalte {terms.plural}, markiere Highlights und bearbeite Löschanfragen.
            </p>
          </div>
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
          {activeTab === "deletion-requests" && <PendingDeletionRequests />}
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
          <p className="text-sm text-gray-600">Offen</p>
        </div>
      </div>

      {/* Print View Modal */}
      <PrintViewModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />
    </div>
  );
}
