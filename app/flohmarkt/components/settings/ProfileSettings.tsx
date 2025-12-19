"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useFlohmarkt } from "../../FlohmarktContext";

export function ProfileSettings() {
  const { user, updateUserProfile } = useFlohmarkt();

  // Profile edit state
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profileEmail, setProfileEmail] = useState(user?.email || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync state when user changes
  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfileEmail(user.email);
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileMessage(null);

    const result = await updateUserProfile(profileName, profileEmail);

    if (result.success) {
      if (result.emailChanged) {
        setProfileMessage({ type: 'success', text: 'Bestätigungs-E-Mail wurde an die neue Adresse gesendet.' });
      } else {
        setProfileMessage({ type: 'success', text: 'Profil wurde aktualisiert.' });
      }
    } else {
      setProfileMessage({ type: 'error', text: result.error || 'Fehler beim Speichern.' });
    }

    setSavingProfile(false);
  };

  const handleReset = () => {
    setProfileName(user?.name || "");
    setProfileEmail(user?.email || "");
    setProfileMessage(null);
  };

  const hasChanges = user && (profileName !== user.name || profileEmail !== user.email);

  return (
    <div className="fixed inset-0 bg-gray-100 z-[3500] flex flex-col">
      {/* Header */}
      <div className="bg-[#003366] text-white p-5 flex justify-between items-center">
        <div>
          <span className="font-bold text-lg">Profil bearbeiten</span>
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
          <h3 className="text-[#003366] mt-0 mb-4 font-bold">Dein Profil</h3>

          {profileMessage && (
            <div className={`p-3 rounded-md mb-4 ${
              profileMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {profileMessage.text}
            </div>
          )}

          {user && (
            <div className="space-y-4">
              <div>
                <label className="text-gray-700 text-sm font-semibold block mb-1">Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003366] text-gray-900 font-medium"
                />
              </div>
              <div>
                <label className="text-gray-700 text-sm font-semibold block mb-1">E-Mail</label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003366] text-gray-900 font-medium"
                />
                <p className="text-gray-500 text-xs mt-1">
                  Bei Änderung der E-Mail wird eine Bestätigungs-E-Mail gesendet.
                </p>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleSaveProfile}
                  disabled={savingProfile || !hasChanges}
                  className="bg-[#003366] text-white px-4 py-2 rounded-md font-bold cursor-pointer hover:bg-[#002244] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingProfile ? 'Speichern...' : 'Speichern'}
                </button>
                <button
                  onClick={handleReset}
                  disabled={savingProfile || !hasChanges}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md cursor-pointer hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Zurücksetzen
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
