"use client";

import { useState } from "react";
import Link from "next/link";
import { useFlohmarkt } from "../../FlohmarktContext";
import { EventCard } from "./EventCard";
import { MemberManagement } from "./MemberManagement";
import { CreateEventForm } from "./CreateEventForm";

type Tab = "events" | "members" | "create";

export function EventOverview() {
  const { currentTenant, tenantEvents, user, logout, isAdmin } = useFlohmarkt();
  const [activeTab, setActiveTab] = useState<Tab>("events");

  if (!currentTenant) {
    return null;
  }

  // Separate active events (draft + published) from archived events
  const activeEvents = tenantEvents.filter(e => e.status === 'draft' || e.status === 'published');
  const archivedEvents = tenantEvents.filter(e => e.status === 'archived');

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

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 px-5">
        <div className="flex gap-1 max-w-[1000px] mx-auto">
          <button
            onClick={() => setActiveTab("events")}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === "events"
                ? "border-[#003366] text-[#003366]"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            Aktive Events ({activeEvents.length})
          </button>
          <button
            onClick={() => setActiveTab("members")}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === "members"
                ? "border-[#003366] text-[#003366]"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            Mitglieder
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === "create"
                ? "border-[#003366] text-[#003366]"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            + Neues Event
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 overflow-y-auto w-full max-w-[1000px] mx-auto flex-grow">
        {activeTab === "events" && (
          <>
            {/* Active Events Section */}
            {activeEvents.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow-md text-center mb-6">
                <h3 className="text-[#003366] mt-0">Noch keine Events</h3>
                <p className="text-gray-600 mb-4">
                  Erstelle dein erstes Event, um Spots zu sammeln.
                </p>
                <button
                  onClick={() => setActiveTab("create")}
                  className="bg-[#003366] text-white px-6 py-3 rounded-md font-bold cursor-pointer hover:bg-[#002244]"
                >
                  Event erstellen
                </button>
              </div>
            ) : (
              <div className="grid gap-4 mb-6">
                {activeEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}

            {/* Archived Events Section */}
            {archivedEvents.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <span>📦</span>
                  <span>Archivierte Events ({archivedEvents.length})</span>
                </h2>
                <div className="grid gap-4">
                  {archivedEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "members" && <MemberManagement />}

        {activeTab === "create" && (
          <CreateEventForm onSuccess={() => setActiveTab("events")} />
        )}
      </div>
    </div>
  );
}
