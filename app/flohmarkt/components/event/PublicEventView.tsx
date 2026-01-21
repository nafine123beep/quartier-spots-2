"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useFlohmarkt } from "../../FlohmarktContext";
import { AppTabType } from "../../types";
import { AccessMode } from "../../lib/loadEventData";
import { getSpotTerms } from "../../lib/spotTerms";
import { getPublicImageUrl } from "../../lib/imageUpload";
import { ListView } from "./ListView";
import { MapView } from "./MapView";
import { SpotForm } from "./SpotForm";
import { DeleteSpotForm } from "./DeleteSpotForm";
import { CollapsibleHeader } from "../shared/CollapsibleHeader";

interface PublicEventViewProps {
  accessMode?: AccessMode;
}

export function PublicEventView({ accessMode = 'public' }: PublicEventViewProps) {
  const { currentTab, setCurrentTab, currentTenantEvent, currentTenant, user } = useFlohmarkt();
  const terms = getSpotTerms(currentTenantEvent?.spot_term_singular, currentTenantEvent?.spot_term_plural);
  const searchParams = useSearchParams();
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Check for tab query parameter and auto-select tab
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'form' || tabParam === 'list' || tabParam === 'map' || tabParam === 'delete') {
      setCurrentTab(tabParam as AppTabType);
    }
  }, [searchParams, setCurrentTab]);

  // Update page title dynamically
  useEffect(() => {
    if (currentTenantEvent && currentTenant) {
      document.title = `${currentTenantEvent.title} | ${currentTenant.name}`;
    }
  }, [currentTenantEvent, currentTenant]);

  if (!currentTenantEvent) {
    return null;
  }

  const images = currentTenantEvent.images ?? [];
  const hasImages = images.length > 0;
  const coverImage = images.find(img => img.is_cover) || images[0];

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxImage(getPublicImageUrl(images[index].storage_path));
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next'
      ? (currentImageIndex + 1) % images.length
      : (currentImageIndex - 1 + images.length) % images.length;
    setCurrentImageIndex(newIndex);
    setLightboxImage(getPublicImageUrl(images[newIndex].storage_path));
  };

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
      {/* Lightbox for full-size image viewing */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 z-10"
          >
            &times;
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); navigateLightbox('prev'); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-gray-300 bg-black/30 px-4 py-2 rounded"
              >
                &#8249;
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); navigateLightbox('next'); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-gray-300 bg-black/30 px-4 py-2 rounded"
              >
                &#8250;
              </button>
            </>
          )}

          <img
            src={lightboxImage}
            alt="Event Bild"
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded">
              {currentImageIndex + 1} / {images.length}
            </div>
          )}
        </div>
      )}

      <CollapsibleHeader>
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

        {/* Hero Image Gallery */}
        {hasImages && (
          <div className="relative bg-gray-900">
            {/* Main Cover Image */}
            <div
              className="relative h-48 sm:h-64 cursor-pointer"
              onClick={() => openLightbox(images.indexOf(coverImage))}
            >
              <img
                src={getPublicImageUrl(coverImage.storage_path)}
                alt={currentTenantEvent.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

              {/* View all images button */}
              {images.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); openLightbox(0); }}
                  className="absolute bottom-3 right-3 bg-black/70 hover:bg-black/90 text-white text-sm px-4 py-2 rounded-full flex items-center gap-2 transition-colors shadow-lg"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Alle {images.length} Fotos ansehen
                </button>
              )}
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
                <div className="text-sm opacity-80 flex flex-col md:flex-row md:gap-4">
                  {currentTenantEvent.starts_at && (
                    <span>
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
      </CollapsibleHeader>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto flex overflow-x-auto">
          {tabButtons.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`
                flex-1 min-w-[120px] px-5 py-4 font-medium text-sm
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
