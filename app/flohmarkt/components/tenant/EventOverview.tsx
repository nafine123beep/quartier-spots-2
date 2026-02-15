"use client";

import { useState } from "react";
import Link from "next/link";
import { useFlohmarkt } from "../../FlohmarktContext";
import { EventCard } from "./EventCard";
import { CreateEventCard } from "./CreateEventCard";
import { EventCreatedNotification } from "./EventCreatedNotification";

export function EventOverview() {
  const { currentTenant, tenantEvents, user, logout, isAdmin } = useFlohmarkt();
  const [showNotification, setShowNotification] = useState(false);
  const [createdEvent, setCreatedEvent] = useState<{ id: string; title: string; slug: string } | null>(null);

  if (!currentTenant) {
    return null;
  }

  // Sort events by date and time (most recent first), events without dates go to the end
  const sortByDateTime = (a: typeof tenantEvents[0], b: typeof tenantEvents[0]) => {
    // Events without dates go to the end
    if (!a.starts_at && !b.starts_at) return 0;
    if (!a.starts_at) return 1;
    if (!b.starts_at) return -1;

    const dateA = new Date(a.starts_at).getTime();
    const dateB = new Date(b.starts_at).getTime();
    return dateB - dateA; // Most recent first
  };

  const activeEvents = tenantEvents
    .filter(e => e.status === 'active')
    .sort(sortByDateTime);
  const archivedEvents = tenantEvents
    .filter(e => e.status === 'archived')
    .sort(sortByDateTime);

  return (
    <div className="fixed inset-0 bg-gray-100 z-[3500] flex flex-col">
      {/* Header */}
      <div className="bg-[#003366] text-white p-5 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link
            href="/flohmarkt/organizations"
            className="bg-transparent border-none text-white text-2xl cursor-pointer hover:opacity-80 no-underline"
          >
            ←
          </Link>
          <div>
            <span className="font-bold text-lg">{currentTenant.name}</span>
            {user && (
              <div className="text-sm text-gray-300 mt-1">
                {user.name !== user.email ? `${user.name} (${user.email})` : user.email}
                {isAdmin && <span className="ml-2 bg-yellow-500 text-black px-2 py-0.5 rounded text-xs">Admin</span>}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href="/flohmarkt/settings"
            className="bg-transparent border border-white text-white px-2.5 py-1.5 rounded cursor-pointer hover:bg-white/10 no-underline"
            title="Einstellungen"
          >
            ⚙️
          </Link>
          <button
            onClick={logout}
            className="bg-transparent border border-white text-white px-2.5 py-1.5 rounded cursor-pointer hover:bg-white/10"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-5 overflow-y-auto flex-grow">
        <div className="w-full max-w-[1000px] mx-auto">
          {/* Active Events Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Aktive Events ({activeEvents.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Create Event Tile - Always first */}
              <CreateEventCard />

              {/* Active Event Tiles */}
              {activeEvents.map((event) => (
                <EventCard key={event.id} event={event} variant="default" />
              ))}
            </div>

            {/* Empty State */}
            {activeEvents.length === 0 && (
              <p className="text-gray-600 text-center py-8 mt-4">
                Noch keine aktiven Events. Erstelle dein erstes Event!
              </p>
            )}
          </div>

          {/* Archived Events Section */}
          {archivedEvents.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
                <span>📦</span>
                <span>Archivierte Events ({archivedEvents.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {archivedEvents.map((event) => (
                  <EventCard key={event.id} event={event} variant="default" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Event Created Notification Modal */}
      {createdEvent && (
        <EventCreatedNotification
          isOpen={showNotification}
          onClose={() => setShowNotification(false)}
          eventId={createdEvent.id}
          eventTitle={createdEvent.title}
          eventSlug={createdEvent.slug}
          tenantSlug={currentTenant.slug}
        />
      )}
    </div>
  );
}
