"use client";

import { useFlohmarkt } from "../../FlohmarktContext";

export function SettingsPage() {
  const { user, currentTenant, isAdmin, setCurrentView, logout } = useFlohmarkt();

  const handleSwitchTenant = () => {
    setCurrentView("tenantDashboard");
  };

  const handleBackToEvents = () => {
    setCurrentView("eventOverview");
  };

  return (
    <div className="fixed inset-0 bg-gray-100 z-[3500] flex flex-col">
      {/* Header */}
      <div className="bg-[#003366] text-white p-5 flex justify-between items-center">
        <div>
          <span className="font-bold text-lg">Einstellungen</span>
        </div>
        <button
          onClick={handleBackToEvents}
          className="bg-transparent border border-white text-white px-2.5 py-1.5 rounded cursor-pointer hover:bg-white/10"
        >
          ← Zurück
        </button>
      </div>

      {/* Content */}
      <div className="p-5 overflow-y-auto w-full max-w-[600px] mx-auto flex-grow">
        {/* Profile Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-5">
          <h3 className="text-[#003366] mt-0 mb-4">Profil</h3>
          {user && (
            <div className="space-y-3">
              <div>
                <label className="text-gray-500 text-sm">Name</label>
                <p className="m-0 font-medium">{user.name}</p>
              </div>
              <div>
                <label className="text-gray-500 text-sm">E-Mail</label>
                <p className="m-0 font-medium">{user.email}</p>
              </div>
            </div>
          )}
        </div>

        {/* Current Tenant Section */}
        {currentTenant && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-5">
            <h3 className="text-[#003366] mt-0 mb-4">Aktuelle Organisation</h3>
            <div className="space-y-3">
              <div>
                <label className="text-gray-500 text-sm">Name</label>
                <p className="m-0 font-medium">{currentTenant.name}</p>
              </div>
              <div>
                <label className="text-gray-500 text-sm">URL-Slug</label>
                <p className="m-0 font-medium">/{currentTenant.slug}</p>
              </div>
              {isAdmin && currentTenant.join_password && (
                <div>
                  <label className="text-gray-500 text-sm">Beitritts-Passwort</label>
                  <p className="m-0 font-medium">{currentTenant.join_password}</p>
                </div>
              )}
              <div>
                <label className="text-gray-500 text-sm">Deine Rolle</label>
                <p className="m-0">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    isAdmin ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {isAdmin ? 'Admin' : 'Mitglied'}
                  </span>
                </p>
              </div>
            </div>

            <button
              onClick={handleSwitchTenant}
              className="mt-5 w-full bg-white border-2 border-[#003366] text-[#003366] p-3 rounded-md font-bold cursor-pointer hover:bg-gray-50"
            >
              Organisation wechseln
            </button>
          </div>
        )}

        {/* Logout Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-[#003366] mt-0 mb-4">Sitzung</h3>
          <button
            onClick={logout}
            className="w-full bg-red-600 text-white p-3 rounded-md font-bold cursor-pointer hover:bg-red-700"
          >
            Ausloggen
          </button>
        </div>
      </div>
    </div>
  );
}
