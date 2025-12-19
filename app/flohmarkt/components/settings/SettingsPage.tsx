"use client";

import Link from "next/link";
import { useFlohmarkt } from "../../FlohmarktContext";

export function SettingsPage() {
  const { user, currentTenant, isAdmin, logout } = useFlohmarkt();

  return (
    <div className="fixed inset-0 bg-gray-100 z-[3500] flex flex-col">
      {/* Header */}
      <div className="bg-[#003366] text-white p-5 flex justify-between items-center">
        <div>
          <span className="font-bold text-lg">Einstellungen</span>
        </div>
        <Link
          href={currentTenant ? `/flohmarkt/organizations/${currentTenant.slug}` : "/flohmarkt/organizations"}
          className="bg-transparent border border-white text-white px-2.5 py-1.5 rounded cursor-pointer hover:bg-white/10 no-underline"
        >
          ← Zurück
        </Link>
      </div>

      {/* Content */}
      <div className="p-5 overflow-y-auto w-full max-w-[600px] mx-auto flex-grow">
        {/* Profile Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[#003366] m-0 font-bold">Profil</h3>
            <Link
              href="/flohmarkt/settings/profile"
              className="text-gray-500 hover:text-[#003366] text-lg no-underline"
              title="Bearbeiten"
            >
              ✏️
            </Link>
          </div>

          {user && (
            <div className="space-y-3">
              <div>
                <label className="text-gray-700 text-sm font-semibold">Name</label>
                <p className="m-0 font-medium text-gray-900">{user.name}</p>
              </div>
              <div>
                <label className="text-gray-700 text-sm font-semibold">E-Mail</label>
                <p className="m-0 font-medium text-gray-900">{user.email}</p>
              </div>
            </div>
          )}
        </div>

        {/* Current Tenant Section */}
        {currentTenant && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[#003366] m-0 font-bold">Aktuelle Organisation</h3>
              {isAdmin && (
                <Link
                  href="/flohmarkt/settings/organization"
                  className="text-gray-500 hover:text-[#003366] text-lg no-underline"
                  title="Bearbeiten"
                >
                  ✏️
                </Link>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-gray-700 text-sm font-semibold">Name</label>
                <p className="m-0 font-medium text-gray-900">{currentTenant.name}</p>
              </div>
              <div>
                <label className="text-gray-700 text-sm font-semibold">URL-Slug</label>
                <p className="m-0 font-medium text-gray-900">/{currentTenant.slug}</p>
              </div>
              {isAdmin && currentTenant.join_password && (
                <div>
                  <label className="text-gray-700 text-sm font-semibold">Beitritts-Passwort</label>
                  <p className="m-0 font-medium text-gray-900">{currentTenant.join_password}</p>
                </div>
              )}
              <div>
                <label className="text-gray-700 text-sm font-semibold">Deine Rolle</label>
                <p className="m-0">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    isAdmin ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-200 text-gray-800'
                  }`}>
                    {isAdmin ? 'Admin' : 'Mitglied'}
                  </span>
                </p>
              </div>
            </div>

            <Link
              href="/flohmarkt/organizations"
              className="mt-5 w-full bg-white border-2 border-[#003366] text-[#003366] p-3 rounded-md font-bold cursor-pointer hover:bg-gray-50 block text-center no-underline"
            >
              Organisation wechseln
            </Link>
          </div>
        )}

        {/* Logout Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-[#003366] mt-0 mb-4 font-bold">Sitzung</h3>
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
