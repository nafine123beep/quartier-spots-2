"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useFlohmarkt } from "../../FlohmarktContext";
import { AppTabType } from "../../types";
import { AccessMode } from "../../lib/loadEventData";
import { getSpotTerms } from "../../lib/spotTerms";
import { ListView } from "./ListView";
import { MapView } from "./MapView";
import { SpotForm } from "./SpotForm";
import { DeleteSpotForm } from "./DeleteSpotForm";

interface PublicEventViewProps {
  accessMode?: AccessMode;
}

export function PublicEventView({ accessMode = 'public' }: PublicEventViewProps) {
  const { currentTab, setCurrentTab, currentTenantEvent, currentTenant, user } = useFlohmarkt();
  const terms = getSpotTerms(currentTenantEvent?.spot_term_singular, currentTenantEvent?.spot_term_plural);
  const searchParams = useSearchParams();

  // Check for tab query parameter and auto-select tab
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'form' || tabParam === 'list' || tabParam === 'map' || tabParam === 'delete') {
      setCurrentTab(tabParam as AppTabType);
    }
  }, [searchParams, setCurrentTab]);

  if (!currentTenantEvent) {
    return null;
  }

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

  const renderContent = () => {
    switch (currentTab) {
      case "list":
        return <ListView />;
      case "map":
        return <MapView />;
      case "form":
        return <SpotForm />;
      case "delete":
        return <DeleteSpotForm />;
      default:
        return <ListView />;
    }
  };

  const tabButtons: { id: AppTabType; label: string; icon: string }[] = [
    { id: "list", label: "Liste", icon: "📋" },
    { id: "map", label: "Karte", icon: "🗺️" },
    { id: "form", label: terms.registerSpot, icon: "➕" },
  ];

  const handleBackToAdmin = () => {
    if (!currentTenant) return;
    // Navigate to event management page
    window.location.href = `/flohmarkt/organizations/${currentTenant.slug}/events/${currentTenantEvent.slug || currentTenantEvent.id}`;
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Draft Banner - Only shown when event is in draft status */}
      {currentTenantEvent.status === 'draft' && (
        <div className={`${accessMode === 'preview' ? 'bg-purple-500 border-purple-600' : 'bg-yellow-500 border-yellow-600'} text-gray-900 px-4 py-3 shadow-md border-b-2`}>
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
            <span className="text-2xl">{accessMode === 'preview' ? '👁️' : '⚠️'}</span>
            <div className="flex-1 text-center sm:text-left">
              <p className={`font-bold text-sm sm:text-base m-0 ${accessMode === 'preview' ? 'text-white' : ''}`}>
                {accessMode === 'preview'
                  ? 'VORSCHAU-LINK: Du siehst eine Vorabversion dieses Events'
                  : 'VORSCHAU-MODUS: Dieses Event ist noch nicht veröffentlicht'
                }
              </p>
              <p className={`text-xs sm:text-sm m-0 mt-1 ${accessMode === 'preview' ? 'text-purple-100' : ''}`}>
                {accessMode === 'preview'
                  ? 'Diese Ansicht ist nur über den Vorschau-Link zugänglich. Das Event ist noch nicht öffentlich.'
                  : 'Nur Organisatoren können diese Seite sehen. Veröffentliche das Event, damit Teilnehmer es sehen können.'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-[#003366] text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold m-0">{currentTenantEvent.title}</h1>
                {/* Draft Badge in Header */}
                {currentTenantEvent.status === 'draft' && (
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
              {currentTenantEvent.description && (
                <p className="text-sm opacity-90 m-0 mb-2">{currentTenantEvent.description}</p>
              )}
              <div className="text-sm opacity-80">
                {currentTenantEvent.starts_at && (
                  <span className="mr-4">
                    Start: {formatDate(currentTenantEvent.starts_at)}
                  </span>
                )}
                {currentTenantEvent.ends_at && (
                  <span>Ende: {formatDate(currentTenantEvent.ends_at)}</span>
                )}
              </div>
            </div>

            {/* Management Button - Only visible for authenticated tenant members */}
            {user && currentTenant && (
              <button
                onClick={handleBackToAdmin}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors whitespace-nowrap backdrop-blur-sm border border-white/30"
                title="Zurück zur Event-Verwaltung"
              >
                <span>⚙️</span>
                <span className="hidden sm:inline">Event verwalten</span>
                <span className="sm:hidden">Verwalten</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto flex overflow-x-auto">
          {tabButtons.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`
                flex-1 min-w-[120px] px-4 py-3 font-medium text-sm
                transition-all duration-200 border-b-2
                ${
                  currentTab === tab.id
                    ? "border-[#003366] text-[#003366] bg-blue-50"
                    : "border-transparent text-gray-600 hover:text-[#003366] hover:bg-gray-50"
                }
              `}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">{renderContent()}</div>
    </div>
  );
}
