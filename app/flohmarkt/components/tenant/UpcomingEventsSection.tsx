"use client";

import Link from "next/link";
import { Calendar, ChevronRight } from "lucide-react";
import { TenantEvent } from "../../types";
import { EventCard } from "./EventCard";
import { useFlohmarkt } from "../../FlohmarktContext";

interface UpcomingEventsSectionProps {
  events: TenantEvent[];
}

export function UpcomingEventsSection({ events }: UpcomingEventsSectionProps) {
  const { currentTenant } = useFlohmarkt();

  return (
    <section className="mb-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 m-0">Nächste Events</h2>
        <Link
          href={`/flohmarkt/organizations/${currentTenant?.slug}/events`}
          className="text-[#003366] hover:underline text-sm font-medium"
        >
          Alle Events anzeigen <ChevronRight className="h-4 w-4 inline" aria-hidden="true" />
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">Keine anstehenden Events</h3>
          <p className="text-gray-600 mb-6">
            Erstelle dein erstes Event, um loszulegen!
          </p>
          <Link
            href={`/flohmarkt/organizations/${currentTenant?.slug}/events?mode=create`}
            className="inline-block bg-[#003366] text-white px-6 py-3 rounded-md font-bold hover:bg-[#002244] no-underline"
          >
            Event anlegen
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map(event => (
            <EventCard key={event.id} event={event} variant="compact" />
          ))}
        </div>
      )}
    </section>
  );
}
