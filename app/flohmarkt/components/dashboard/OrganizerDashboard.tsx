"use client";

import { useFlohmarkt } from "../../FlohmarktContext";
import { EventCreateForm } from "./EventCreateForm";
import { EventControlPanel } from "./EventControlPanel";
import { AdminSpotTable } from "./AdminSpotTable";

export function OrganizerDashboard() {
  const { currentEvent, logout } = useFlohmarkt();

  return (
    <div className="fixed inset-0 bg-gray-100 z-[3500] flex flex-col">
      {/* Header */}
      <div className="bg-[#003366] text-white p-5 flex justify-between items-center">
        <span className="font-bold text-lg">Veranstaltungsbereich</span>
        <button
          onClick={logout}
          className="bg-transparent border border-white text-white px-2.5 py-1.5 rounded cursor-pointer hover:bg-white/10"
        >
          Logout
        </button>
      </div>

      {/* Content */}
      <div className="p-5 overflow-y-auto w-full max-w-[1000px] mx-auto flex-grow">
        {!currentEvent ? (
          <EventCreateForm />
        ) : (
          <div className="flex flex-col gap-5">
            <EventControlPanel />
            <AdminSpotTable />
          </div>
        )}
      </div>
    </div>
  );
}
