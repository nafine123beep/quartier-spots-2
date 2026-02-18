"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { List, Map as MapIcon, Plus, Settings } from "lucide-react";
import { useFlohmarkt } from "../../FlohmarktContext";
import { AppTabType } from "../../types";
import { AccessMode } from "../../lib/loadEventData";
import { getSpotTerms } from "../../lib/spotTerms";
import { getPublicImageUrl } from "../../lib/imageUpload";
import { ListView } from "./ListView";
import { MapView } from "./MapView";
import { SpotForm } from "./SpotForm";
import { DeleteSpotForm } from "./DeleteSpotForm";
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

  const tabButtons: { id: AppTabType; label: string; icon: React.ReactNode }[] = [
    { id: "list", label: "Liste", icon: <List className="h-4 w-4" aria-hidden="true" /> },
    { id: "map", label: "Karte", icon: <MapIcon className="h-4 w-4" aria-hidden="true" /> },
    { id: "form", label: terms.registerSpot, icon: <Plus className="h-4 w-4" aria-hidden="true" /> },
  ];

  const handleBackToAdmin = () => {
    if (!currentTenant) return;
    // Navigate to event management page
    window.location.href = `/flohmarkt/organizations/${currentTenant.slug}/events/${currentTenantEvent.slug || currentTenantEvent.id}`;
  };

  return (
    <div className={`${embedded ? 'absolute' : 'fixed'} inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col`}>
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

      {/* Header with Thumbnail + Drawer */}
      <MobileEventHeaderDrawer
        event={currentTenantEvent}
        coverImage={coverImage}
        accessMode={accessMode}
        onImageClick={openLightbox}
        formatDate={formatDate}
        embedded={embedded}
        managementButton={
          user && currentTenant && !embedded ? (
            <button
              onClick={handleBackToAdmin}
              className="w-full flex items-center justify-center gap-2 bg-[#003366] hover:bg-[#002244] text-white px-4 py-3 rounded-lg font-medium text-sm transition-colors"
            >
              <Settings className="h-4 w-4" aria-hidden="true" />
              <span>Event verwalten</span>
            </button>
          ) : undefined
        }
      />

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
                flex items-center justify-center gap-2
                ${
                  currentTab === tab.id
                    ? "border-[#003366] text-[#003366] bg-blue-50"
                    : "border-transparent text-gray-600 hover:text-[#003366] hover:bg-gray-50"
                }
              `}
            >
              {tab.icon}
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
