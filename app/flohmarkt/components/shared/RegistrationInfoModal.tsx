"use client";

import { useState, useEffect } from "react";
import { getPublicImageUrl } from "../../lib/imageUpload";
import { TenantEvent } from "../../types";
import { getSpotTerms } from "../../lib/spotTerms";
import { AccessMode } from "../../lib/loadEventData";

interface RegistrationInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: TenantEvent;
  accessMode?: AccessMode;
}

export function RegistrationInfoModal({ isOpen, onClose, event, accessMode = 'public' }: RegistrationInfoModalProps) {
  const terms = getSpotTerms(event?.spot_term_singular, event?.spot_term_plural);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = event.images ?? [];
  const hasImages = images.length > 0;
  const coverImage = images.find(img => img.is_cover) || images[0];

  // Auto-close after 5 seconds
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [isOpen, onClose]);

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

  if (!isOpen) return null;

  return (
    <>
      {/* Lightbox for full-size image viewing */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center"
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

      {/* Modal Overlay */}
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9998] p-4 overflow-y-auto">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Draft Banner - Only shown when event is in draft status */}
          {event.status === 'draft' && (
            <div className={`${accessMode === 'preview' ? 'bg-purple-500 border-purple-600' : 'bg-yellow-500 border-yellow-600'} text-gray-900 px-4 py-3 border-b-2 rounded-t-xl`}>
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl">{accessMode === 'preview' ? '👁️' : '⚠️'}</span>
                <div className="flex-1 text-center sm:text-left">
                  <p className={`font-bold text-sm sm:text-base m-0 ${accessMode === 'preview' ? 'text-white' : ''}`}>
                    {accessMode === 'preview'
                      ? 'VORSCHAU-LINK: Du siehst eine Vorabversion dieses Events'
                      : 'VORSCHAU-MODUS: Dieses Event ist noch nicht veröffentlicht'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Hero Image Gallery */}
          {hasImages && (
            <div className="relative bg-gray-900">
              <div
                className="relative h-48 sm:h-64 cursor-pointer"
                onClick={() => openLightbox(images.indexOf(coverImage))}
              >
                <img
                  src={getPublicImageUrl(coverImage.storage_path)}
                  alt={event.title}
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

          {/* Main Content */}
          <div className="p-8 sm:p-10 relative">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-4xl leading-none transition-colors"
              aria-label="Schließen"
            >
              ×
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <h1 className="text-3xl sm:text-4xl font-bold text-[#003366] m-0">
                  Am {event.title} teilnehmen
                </h1>
                {/* Draft Badge */}
                {event.status === 'draft' && (
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
                {terms.enterYourSpot}
              </p>
            </div>

            {/* Event Details */}
            <div className="space-y-6 mb-8">
              {/* Description */}
              {event.description && (
                <div>
                  <h2 className="text-lg font-bold text-[#003366] mb-2">Über das Event</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {event.description}
                  </p>
                </div>
              )}

              {/* Date and Time */}
              {(event.starts_at || event.ends_at) && (
                <div>
                  <h2 className="text-lg font-bold text-[#003366] mb-2">Wann</h2>
                  <div className="text-gray-700 space-y-1">
                    {event.starts_at && (
                      <p className="flex items-center gap-2 m-0">
                        <span className="font-medium">Start:</span>
                        <span>{formatDate(event.starts_at)}</span>
                      </p>
                    )}
                    {event.ends_at && (
                      <p className="flex items-center gap-2 m-0">
                        <span className="font-medium">Ende:</span>
                        <span>{formatDate(event.ends_at)}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Location */}
              {event.map_center_address && (
                <div>
                  <h2 className="text-lg font-bold text-[#003366] mb-2">Wo</h2>
                  <div className="text-gray-700">
                    <p className="flex items-center gap-2 m-0">
                      <span>📍</span>
                      <span>{event.map_center_address}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="mb-4">
              <button
                onClick={onClose}
                className="w-full bg-[#003366] text-white px-6 py-4 rounded-lg text-lg font-bold hover:bg-[#002244] transition-colors shadow-md"
              >
                {terms.registerSpot}
              </button>
            </div>

            {/* Info Footer */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 m-0">
                Keine Anmeldung erforderlich • Kostenlos
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Das Formular öffnet sich automatisch...
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
