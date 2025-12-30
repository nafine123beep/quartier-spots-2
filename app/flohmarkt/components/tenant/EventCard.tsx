"use client";

import Link from "next/link";
import { useFlohmarkt } from "../../FlohmarktContext";
import { TenantEvent } from "../../types";

interface EventCardProps {
  event: TenantEvent;
}

export function EventCard({ event }: EventCardProps) {
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
    draft: "bg-gray-100 text-gray-600",
    published: "bg-green-100 text-green-700",
    archived: "bg-yellow-100 text-yellow-700",
  };

  const statusLabels = {
    draft: "Entwurf",
    published: "Veröffentlicht",
    archived: "Archiviert",
  };

  // Fallback to event ID if slug is not available (for events created before slug migration)
  const eventIdentifier = event.slug || event.id;

  return (
    <div className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-grow">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="m-0 text-[#003366] text-lg">{event.title}</h3>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[event.status]}`}>
              {statusLabels[event.status]}
            </span>
          </div>
          {event.description && (
            <p className="text-gray-600 text-sm m-0 mb-2">{event.description}</p>
          )}
          <div className="text-gray-600 text-sm">
            {event.starts_at && (
              <span>Start: {formatDate(event.starts_at)}</span>
            )}
            {event.ends_at && (
              <span className="ml-4">Ende: {formatDate(event.ends_at)}</span>
            )}
          </div>
        </div>
        <Link
          href={`/flohmarkt/organizations/${currentTenant?.slug}/events/${eventIdentifier}`}
          className="bg-[#003366] text-white px-4 py-2 rounded-md font-bold cursor-pointer hover:bg-[#002244] ml-4 no-underline relative"
        >
          Verwalten
          {pendingCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md">
              {pendingCount}
            </span>
          )}
        </Link>
      </div>
    </div>
  );
}
