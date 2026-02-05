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
import { MobileEventHeaderDrawer } from "../shared/MobileEventHeaderDrawer";
import { RegistrationInfoModal } from "../shared/RegistrationInfoModal";

interface PublicEventViewProps {
  accessMode?: AccessMode;
  embedded?: boolean;
}

export function PublicEventView({ accessMode = 'public', embedded = false }: PublicEventViewProps) {
  const { currentTab, setCurrentTab, currentTenantEvent, currentTenant, user, setIsLightboxOpen } = useFlohmarkt();
  const terms = getSpotTerms(currentTenantEvent?.spot_term_singular, currentTenantEvent?.spot_term_plural);
  const searchParams = useSearchParams();
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [hasSeenModalForThisSession, setHasSeenModalForThisSession] = useState(false);

  // Check for tab query parameter and auto-select tab (only on mount or when searchParams change)
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'form' || tabParam === 'list' || tabParam === 'map' || tabParam === 'delete') {
      if (tabParam === 'form' && !hasSeenModalForThisSession) {
        // Show registration modal first for form tab
        setCurrentTab('form');
        setShowRegistrationModal(true);
      } else {
        setCurrentTab(tabParam as AppTabType);
      }
    } else {
      // Default to map view when no tab parameter is specified
      setCurrentTab('map');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, setCurrentTab]); // Removed hasSeenModalForThisSession to prevent tab reset on modal close

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
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
    setIsLightboxOpen(false);
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
        // Don't show the form until modal has been seen
        return showRegistrationModal ? null : <SpotForm />;
      case "delete":
        return <DeleteSpotForm />;
      default:
        return <ListView />;
    }
  };

  // Handle tab change to show registration modal when form tab is clicked
  const handleTabClick = (tabId: AppTabType) => {
    if (tabId === "form" && !hasSeenModalForThisSession) {
      // Show the modal first, and set the tab so it appears active
      setCurrentTab("form");
      setShowRegistrationModal(true);
    } else {
      setCurrentTab(tabId);
    }
  };

  // Handle modal close - proceed to form
  const handleRegistrationModalClose = () => {
    setShowRegistrationModal(false);
    setHasSeenModalForThisSession(true);
    setCurrentTab("form");
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

      {/* Mobile Header with Drawer - Only on mobile, hidden in embedded mode */}
      {!embedded && (
        <MobileEventHeaderDrawer
          event={currentTenantEvent}
          coverImage={coverImage}
          accessMode={accessMode}
          onImageClick={openLightbox}
          formatDate={formatDate}
          managementButton={
            user && currentTenant ? (
              <button
                onClick={handleBackToAdmin}
                className="w-full flex items-center justify-center gap-2 bg-[#003366] hover:bg-[#002244] text-white px-4 py-3 rounded-lg font-medium text-sm transition-colors"
              >
                <span>⚙️</span>
                <span>Event verwalten</span>
              </button>
            ) : undefined
          }
        />
      )}

      {/* Desktop Header - Hidden on mobile and in embedded mode shows simplified version */}
      <div className={embedded ? "block" : "hidden md:block"}>
        <CollapsibleHeader>
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

                {/* Management Button - Only visible for authenticated tenant members, hidden in embedded mode */}
                {user && currentTenant && !embedded && (
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
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto flex overflow-x-auto">
          {tabButtons.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`
                flex-1 min-w-[120px] px-5 py-3 font-medium text-sm min-h-[44px]
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

      {/* Registration Info Modal */}
      <RegistrationInfoModal
        isOpen={showRegistrationModal}
        onClose={handleRegistrationModalClose}
        event={currentTenantEvent}
        accessMode={accessMode}
      />
    </div>
  );
}
