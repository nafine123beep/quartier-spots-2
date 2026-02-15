"use client";

import Link from "next/link";
import { useFlohmarkt } from "../../FlohmarktContext";
import { TenantEvent } from "../../types";
import { getPublicImageUrl } from "../../lib/imageUpload";

interface EventCardProps {
  event: TenantEvent;
  variant?: 'default' | 'compact';
}

export function EventCard({ event, variant = 'default' }: EventCardProps) {
  const { currentTenant, deletionRequests } = useFlohmarkt();

  // Count pending deletion requests for this event
  const pendingCount = deletionRequests.filter(
    r => r.event_id === event.id && r.status === 'pending'
  ).length;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Kein Datum";
    return new Date(dateString).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusColors = {
    active: "bg-green-100 text-green-700",
    archived: "bg-yellow-100 text-yellow-700",
  };

  const statusLabels = {
    active: "Aktiv",
    archived: "Archiviert",
  };

  // Fallback to event ID if slug is not available (for events created before slug migration)
  const eventIdentifier = event.slug || event.id;

  // Get cover image or first image
  const coverImage = event.images?.find(img => img.is_cover) || event.images?.[0];

  const isCompact = variant === 'compact';
  const buttonText = isCompact ? 'Öffnen' : 'Verwalten';

  return (
    <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden ${
      isCompact ? 'h-full flex flex-col' : ''
    }`}>
      {/* Cover Image */}
      {coverImage && (
        <div className={`relative bg-gray-100 ${isCompact ? 'h-32' : 'h-40'}`}>
          <img
            src={getPublicImageUrl(coverImage.storage_path)}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className={`${isCompact ? 'p-4 flex-grow flex flex-col' : 'p-5'}`}>
        <div className={`flex ${isCompact ? 'flex-col' : 'justify-between items-start'}`}>
          <div className={`flex-grow ${isCompact ? 'mb-3' : ''}`}>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="m-0 text-[#003366] text-lg">{event.title}</h3>
              {!isCompact && (
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[event.status]}`}>
                  {statusLabels[event.status]}
                </span>
              )}
            </div>
            {event.description && !isCompact && (
              <p className="text-gray-600 text-sm m-0 mb-2 line-clamp-2">{event.description}</p>
            )}
            <div className="text-gray-600 text-sm">
              {event.starts_at && (
                <div>{formatDate(event.starts_at)}</div>
              )}
            </div>
          </div>

          {isCompact ? (
            <Link
              href={`/flohmarkt/organizations/${currentTenant?.slug}/events/${eventIdentifier}`}
              className="mt-auto w-full bg-[#003366] text-white px-4 py-2 rounded-md font-bold text-center hover:bg-[#002244] no-underline block"
            >
              {buttonText}
            </Link>
          ) : (
            <Link
              href={`/flohmarkt/organizations/${currentTenant?.slug}/events/${eventIdentifier}`}
              className="bg-[#003366] text-white px-4 py-2 rounded-md font-bold cursor-pointer hover:bg-[#002244] ml-4 no-underline relative"
            >
              {buttonText}
              {pendingCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                  {pendingCount}
                </span>
              )}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
