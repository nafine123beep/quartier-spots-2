"use client";

import { useFlohmarkt } from "../../FlohmarktContext";
import { EventControlPanel } from "./EventControlPanel";
import { AdminSpotTable } from "./AdminSpotTable";

export function EventDetail() {
  const { currentTenantEvent, currentTenant, user, logout, setCurrentView, isAdmin } = useFlohmarkt();

  if (!currentTenantEvent || !currentTenant) {
    return null;
  }

  const handleBack = () => {
    setCurrentView("eventOverview");
  };

  return (
    <div className="fixed inset-0 bg-gray-100 z-[3500] flex flex-col">
      {/* Header */}
      <div className="bg-[#003366] text-white p-5 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="bg-transparent border-none text-white text-2xl cursor-pointer hover:opacity-80"
          >
            ←
          </button>
          <div>
            <span className="font-bold text-lg">{currentTenantEvent.title}</span>
            <div className="text-sm text-gray-300 mt-1">
              {currentTenant.name}
              {isAdmin && <span className="ml-2 bg-yellow-500 text-black px-2 py-0.5 rounded text-xs">Admin</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <span className="text-sm text-gray-300 hidden sm:inline">
              {user.email}
            </span>
          )}
          <button
            onClick={logout}
            className="bg-transparent border border-white text-white px-2.5 py-1.5 rounded cursor-pointer hover:bg-white/10"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 overflow-y-auto w-full max-w-[1000px] mx-auto flex-grow">
        {/* Event Info */}
        <div className="bg-white p-5 rounded-lg shadow-md mb-5">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="m-0 text-[#003366]">{currentTenantEvent.title}</h2>
              {currentTenantEvent.description && (
                <p className="text-gray-600 mt-2">{currentTenantEvent.description}</p>
              )}
              <div className="text-sm text-gray-500 mt-2">
                {currentTenantEvent.starts_at && (
                  <span>
                    Start: {new Date(currentTenantEvent.starts_at).toLocaleString("de-DE")}
                  </span>
                )}
                {currentTenantEvent.ends_at && (
                  <span className="ml-4">
                    Ende: {new Date(currentTenantEvent.ends_at).toLocaleString("de-DE")}
                  </span>
                )}
              </div>
            </div>
            <span className={`px-3 py-1 rounded text-sm font-medium ${
              currentTenantEvent.status === 'active'
                ? 'bg-green-100 text-green-700'
                : currentTenantEvent.status === 'archived'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {currentTenantEvent.status === 'active' ? 'Aktiv' :
               currentTenantEvent.status === 'archived' ? 'Archiviert' : 'Entwurf'}
            </span>
          </div>
        </div>

        {/* Existing components */}
        <div className="flex flex-col gap-5">
          <EventControlPanel />
          <AdminSpotTable />
        </div>
      </div>
    </div>
  );
}
