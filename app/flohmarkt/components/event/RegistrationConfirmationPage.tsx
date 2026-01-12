"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFlohmarkt } from "../../FlohmarktContext";
import { AccessMode } from "../../lib/loadEventData";
import { getPublicImageUrl } from "../../lib/imageUpload";

interface RegistrationConfirmationPageProps {
  accessMode?: AccessMode;
}

export function RegistrationConfirmationPage({ accessMode = 'public' }: RegistrationConfirmationPageProps) {
  const router = useRouter();
  const { currentTenantEvent, currentTenant } = useFlohmarkt();
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!currentTenantEvent || !currentTenant) {
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

  const handleContinue = () => {
    // Navigate to main event page with form tab selected
    router.push(`/flohmarkt/${currentTenant.slug}/${currentTenantEvent.slug}?tab=form`);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col overflow-y-auto">
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

      {/* Draft Banner - Only shown when event is in draft status */}
      {currentTenantEvent.status === 'draft' && (
        <div className={`${accessMode === 'preview' ? 'bg-purple-500 border-purple-600' : 'bg-yellow-500 border-yellow-600'} text-gray-900 px-4 py-3 shadow-md border-b-2`}>
          <div className="max-w-4xl mx-auto flex items-center justify-center gap-3">
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
                  ? 'Diese Ansicht ist nur über den Vorschau-Link zugänglich.'
                  : 'Nur Organisatoren können diese Seite sehen.'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Image Gallery */}
      {hasImages && (
        <div className="relative bg-gray-900 flex-shrink-0">
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

            {/* Image count badge */}
            {images.length > 1 && (
              <div className="absolute bottom-3 right-3 bg-black/60 text-white text-sm px-3 py-1 rounded-full flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {images.length} Fotos
              </div>
            )}
          </div>

          {/* Thumbnail strip for multiple images */}
          {images.length > 1 && (
            <div className="flex gap-1 p-2 bg-gray-800 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => openLightbox(index)}
                  className={`flex-shrink-0 w-16 h-12 rounded overflow-hidden border-2 transition-all ${
                    image.id === coverImage.id ? 'border-white' : 'border-transparent hover:border-gray-400'
                  }`}
                >
                  <img
                    src={getPublicImageUrl(image.storage_path)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8 sm:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <h1 className="text-3xl sm:text-4xl font-bold text-[#003366] m-0">
                Am {currentTenantEvent.title} teilnehmen
              </h1>
              {/* Draft Badge */}
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
            <p className="text-lg text-gray-600">
              Trage deinen Spot ein und werde Teil des Flohmarkts!
            </p>
          </div>

          {/* Event Details */}
          <div className="space-y-6 mb-8">
            {/* Description */}
            {currentTenantEvent.description && (
              <div>
                <h2 className="text-lg font-bold text-[#003366] mb-2">Über das Event</h2>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {currentTenantEvent.description}
                </p>
              </div>
            )}

            {/* Date and Time */}
            {(currentTenantEvent.starts_at || currentTenantEvent.ends_at) && (
              <div>
                <h2 className="text-lg font-bold text-[#003366] mb-2">Wann</h2>
                <div className="text-gray-700 space-y-1">
                  {currentTenantEvent.starts_at && (
                    <p className="flex items-center gap-2 m-0">
                      <span className="font-medium">Start:</span>
                      <span>{formatDate(currentTenantEvent.starts_at)}</span>
                    </p>
                  )}
                  {currentTenantEvent.ends_at && (
                    <p className="flex items-center gap-2 m-0">
                      <span className="font-medium">Ende:</span>
                      <span>{formatDate(currentTenantEvent.ends_at)}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Location */}
            {currentTenantEvent.map_center_address && (
              <div>
                <h2 className="text-lg font-bold text-[#003366] mb-2">Wo</h2>
                <div className="text-gray-700">
                  <p className="flex items-center gap-2 m-0">
                    <span>📍</span>
                    <span>{currentTenantEvent.map_center_address}</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Call to Action */}
          <div className="space-y-4">
            <button
              onClick={handleContinue}
              className="w-full bg-[#003366] text-white px-8 py-4 rounded-lg text-xl font-bold hover:bg-[#002244] transition-colors shadow-lg hover:shadow-xl"
            >
              Weiter zur Spot Anmeldung →
            </button>
            <p className="text-center text-sm text-gray-500 m-0">
              Keine Anmeldung erforderlich • Kostenlos
            </p>
          </div>

          {/* Back Link */}
          <div className="mt-8 text-center">
            <a
              href={`/flohmarkt/${currentTenant.slug}/${currentTenantEvent.slug}`}
              className="text-[#003366] hover:underline text-sm"
            >
              ← Zurück zur Event-Übersicht
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
