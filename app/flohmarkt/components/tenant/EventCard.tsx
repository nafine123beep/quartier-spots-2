"use client";

import Link from "next/link";
import { useFlohmarkt } from "../../FlohmarktContext";
import { TenantEvent } from "../../types";

interface EventCardProps {
  event: TenantEvent;
}

export function EventCard({ event }: EventCardProps) {
  const { currentTenant } = useFlohmarkt();

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
    active: "bg-green-100 text-green-700",
    archived: "bg-yellow-100 text-yellow-700",
  };

  const statusLabels = {
    draft: "Entwurf",
    active: "Aktiv",
    archived: "Archiviert",
  };

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
          href={`/flohmarkt/organizations/${currentTenant?.id}/events/${event.id}`}
          className="bg-[#003366] text-white px-4 py-2 rounded-md font-bold cursor-pointer hover:bg-[#002244] ml-4 no-underline"
        >
          Verwalten
        </Link>
      </div>
    </div>
  );
}
