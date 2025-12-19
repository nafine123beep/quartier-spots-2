"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useFlohmarkt } from "../../FlohmarktContext";

// Helper function to generate URL-safe slug
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

export function OrganizationSettings() {
  const { currentTenant, isAdmin, updateTenant } = useFlohmarkt();

  // Organization edit state
  const [orgName, setOrgName] = useState(currentTenant?.name || "");
  const [savingOrg, setSavingOrg] = useState(false);
  const [orgMessage, setOrgMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync state when tenant changes
  useEffect(() => {
    if (currentTenant) {
      setOrgName(currentTenant.name);
    }
  }, [currentTenant]);

  const handleSaveOrg = async () => {
    setSavingOrg(true);
    setOrgMessage(null);

    const result = await updateTenant(orgName);

    if (result.success) {
      setOrgMessage({ type: 'success', text: 'Organisation wurde aktualisiert.' });
    } else {
      setOrgMessage({ type: 'error', text: result.error || 'Fehler beim Speichern.' });
    }

    setSavingOrg(false);
  };

  const handleReset = () => {
    setOrgName(currentTenant?.name || "");
    setOrgMessage(null);
  };

  const hasChanges = currentTenant && orgName !== currentTenant.name;

  if (!currentTenant) {
    return (
      <div className="fixed inset-0 bg-gray-100 z-[3500] flex flex-col">
        <div className="bg-[#003366] text-white p-5 flex justify-between items-center">
          <span className="font-bold text-lg">Organisation bearbeiten</span>
          <Link
            href="/flohmarkt/settings"
            className="bg-transparent border border-white text-white px-2.5 py-1.5 rounded cursor-pointer hover:bg-white/10 no-underline"
          >
            ← Zurück
          </Link>
        </div>
        <div className="p-5 overflow-y-auto w-full max-w-[600px] mx-auto flex-grow">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-gray-600">Keine Organisation ausgewählt.</p>
            <Link
              href="/flohmarkt/organizations"
              className="mt-4 inline-block bg-[#003366] text-white px-4 py-2 rounded-md font-bold hover:bg-[#002244] no-underline"
            >
              Zur Organisationsauswahl
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 bg-gray-100 z-[3500] flex flex-col">
        <div className="bg-[#003366] text-white p-5 flex justify-between items-center">
          <span className="font-bold text-lg">Organisation bearbeiten</span>
          <Link
            href="/flohmarkt/settings"
            className="bg-transparent border border-white text-white px-2.5 py-1.5 rounded cursor-pointer hover:bg-white/10 no-underline"
          >
            ← Zurück
          </Link>
        </div>
        <div className="p-5 overflow-y-auto w-full max-w-[600px] mx-auto flex-grow">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-gray-600">Du benötigst Admin-Rechte, um die Organisation zu bearbeiten.</p>
            <Link
              href="/flohmarkt/settings"
              className="mt-4 inline-block bg-[#003366] text-white px-4 py-2 rounded-md font-bold hover:bg-[#002244] no-underline"
            >
              Zurück zu Einstellungen
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-100 z-[3500] flex flex-col">
      {/* Header */}
      <div className="bg-[#003366] text-white p-5 flex justify-between items-center">
        <div>
          <span className="font-bold text-lg">Organisation bearbeiten</span>
        </div>
        <Link
          href="/flohmarkt/settings"
          className="bg-transparent border border-white text-white px-2.5 py-1.5 rounded cursor-pointer hover:bg-white/10 no-underline"
        >
          ← Zurück
        </Link>
      </div>

      {/* Content */}
      <div className="p-5 overflow-y-auto w-full max-w-[600px] mx-auto flex-grow">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-[#003366] mt-0 mb-4 font-bold">{currentTenant.name}</h3>

          {orgMessage && (
            <div className={`p-3 rounded-md mb-4 ${
              orgMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {orgMessage.text}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-gray-700 text-sm font-semibold block mb-1">Name der Organisation</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003366] text-gray-900 font-medium"
              />
            </div>
            <div>
              <label className="text-gray-700 text-sm font-semibold block mb-1">URL-Slug</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">/</span>
                <span className={`font-medium ${hasChanges ? 'text-blue-600' : 'text-gray-900'}`}>
                  {hasChanges ? generateSlug(orgName) : currentTenant.slug}
                </span>
              </div>
              {hasChanges && (
                <p className="text-blue-600 text-xs mt-1">
                  Slug wird automatisch aktualisiert bei Speichern.
                </p>
              )}
            </div>
            <div>
              <label className="text-gray-700 text-sm font-semibold block mb-1">Beitritts-Passwort</label>
              <p className="m-0 font-medium text-gray-900">{currentTenant.join_password || '—'}</p>
              <p className="text-gray-500 text-xs mt-1">
                Teile dieses Passwort mit Personen, die der Organisation beitreten sollen.
              </p>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSaveOrg}
                disabled={savingOrg || !hasChanges}
                className="bg-[#003366] text-white px-4 py-2 rounded-md font-bold cursor-pointer hover:bg-[#002244] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingOrg ? 'Speichern...' : 'Speichern'}
              </button>
              <button
                onClick={handleReset}
                disabled={savingOrg || !hasChanges}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md cursor-pointer hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Zurücksetzen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
