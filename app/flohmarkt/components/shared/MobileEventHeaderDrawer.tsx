"use client";

import { useState, useRef, useCallback, ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { TenantEvent, EventImage } from "../../types";
import { AccessMode } from "../../lib/loadEventData";
import { getPublicImageUrl } from "../../lib/imageUpload";

interface MobileEventHeaderDrawerProps {
  event: TenantEvent;
  coverImage?: EventImage;
  accessMode: AccessMode;
  onImageClick: (index: number) => void;
  formatDate: (dateString?: string) => string;
  managementButton?: ReactNode;
}

export function MobileEventHeaderDrawer({
  event,
  coverImage,
  accessMode,
  onImageClick,
  formatDate,
  managementButton,
}: MobileEventHeaderDrawerProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartY = useRef<number | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const images = event.images ?? [];
  const hasImages = images.length > 0;
  const thumbnailUrl = coverImage ? getPublicImageUrl(coverImage.storage_path) : null;

  // Handle touch start
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    setIsDragging(true);
  }, []);

  // Handle touch move
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartY.current === null) return;

    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;

    // Only allow dragging down (positive deltaY)
    if (deltaY > 0) {
      setDragY(deltaY);
    }
  }, []);

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);

    // If dragged more than 80px down, close the drawer
    if (dragY > 80) {
      setIsDrawerOpen(false);
    }

    setDragY(0);
    touchStartY.current = null;
  }, [dragY]);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  return (
    <>
      {/* Sticky Mini Header - Mobile Only */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#003366] shadow-lg">
        <button
          onClick={openDrawer}
          className="w-full flex items-center gap-3 p-3 text-left"
        >
          {/* Thumbnail */}
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={event.title}
              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xl">📍</span>
            </div>
          )}

          {/* Title */}
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-bold text-base truncate m-0">
              {event.title}
            </h1>
            {event.starts_at && (
              <p className="text-white/70 text-xs m-0 truncate">
                {formatDate(event.starts_at)}
              </p>
            )}
          </div>

          {/* Expand Indicator */}
          <div className="flex-shrink-0 text-white/70">
            <ChevronDown className="w-5 h-5" />
          </div>
        </button>

        {/* Draft indicator bar */}
        {event.status === 'draft' && (
          <div className={`h-1 ${accessMode === 'preview' ? 'bg-purple-500' : 'bg-yellow-500'}`} />
        )}
      </div>

      {/* Spacer to prevent content from going under fixed header - Mobile Only */}
      <div className="md:hidden h-[70px]" />

      {/* Backdrop */}
      {isDrawerOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-50 transition-opacity duration-300"
          onClick={closeDrawer}
        />
      )}

      {/* Bottom Drawer */}
      <div
        ref={drawerRef}
        className={`
          md:hidden fixed left-0 right-0 bottom-0 z-50
          bg-white rounded-t-2xl shadow-2xl
          transition-transform duration-300 ease-out
          ${isDrawerOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
        style={{
          maxHeight: '85vh',
          transform: isDrawerOpen
            ? `translateY(${isDragging ? dragY : 0}px)`
            : 'translateY(100%)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drawer Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Close Button / Header */}
        <div className="flex items-center justify-between px-4 pb-2 border-b border-gray-100">
          <span className="text-sm text-gray-500">Event Details</span>
          <button
            onClick={closeDrawer}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(85vh - 60px)' }}>
          {/* Draft Banner */}
          {event.status === 'draft' && (
            <div className={`${accessMode === 'preview' ? 'bg-purple-500' : 'bg-yellow-500'} text-gray-900 px-4 py-3`}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{accessMode === 'preview' ? '👁️' : '⚠️'}</span>
                <div>
                  <p className={`font-bold text-sm m-0 ${accessMode === 'preview' ? 'text-white' : ''}`}>
                    {accessMode === 'preview' ? 'VORSCHAU-LINK' : 'VORSCHAU-MODUS'}
                  </p>
                  <p className={`text-xs m-0 ${accessMode === 'preview' ? 'text-purple-100' : ''}`}>
                    {accessMode === 'preview'
                      ? 'Event ist noch nicht öffentlich'
                      : 'Nur für Organisatoren sichtbar'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Hero Image */}
          {hasImages && coverImage && (
            <div
              className="relative h-48 cursor-pointer"
              onClick={() => {
                onImageClick(images.indexOf(coverImage));
                closeDrawer();
              }}
            >
              <img
                src={getPublicImageUrl(coverImage.storage_path)}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

              {images.length > 1 && (
                <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full">
                  {images.length} Fotos
                </div>
              )}
            </div>
          )}

          {/* Event Info */}
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-xl font-bold text-gray-900 m-0">{event.title}</h2>
                  {event.status === 'draft' && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                      accessMode === 'preview'
                        ? 'bg-purple-500 text-white'
                        : 'bg-yellow-500 text-gray-900'
                    }`}>
                      {accessMode === 'preview' ? '👁️' : '📝'}
                    </span>
                  )}
                </div>

                {event.description && (
                  <p className="text-gray-600 text-sm m-0 mb-3">{event.description}</p>
                )}

                <div className="space-y-1 text-sm text-gray-500">
                  {event.starts_at && (
                    <span>Start: {formatDate(event.starts_at)}</span>
                  )}
                  {event.ends_at && (
                    <span className="block">Ende: {formatDate(event.ends_at)}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Management Button */}
            {managementButton && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                {managementButton}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
