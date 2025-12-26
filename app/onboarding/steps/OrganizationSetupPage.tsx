"use client";

import { useState } from "react";
import { useFlohmarkt } from "@/app/flohmarkt/FlohmarktContext";
import { generateSlug } from "@/app/flohmarkt/utils/slug";

interface OrganizationSetupPageProps {
  onComplete: () => void;
  onBack: () => void;
  username: string;
}

export default function OrganizationSetupPage({ onComplete, onBack, username }: OrganizationSetupPageProps) {
  const [mode, setMode] = useState<"choose" | "create" | "join">("choose");
  const { createTenant, searchTenants, joinTenant } = useFlohmarkt();

  // Create tenant state
  const [createName, setCreateName] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);

  // Join tenant state
  const [joinQuery, setJoinQuery] = useState("");
  const [joinResults, setJoinResults] = useState<any[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<any | null>(null);
  const [joinPassword, setJoinPassword] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinLoading, setJoinLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreateLoading(true);

    const result = await createTenant(createName, createPassword);

    if (!result.success) {
      setCreateError(result.error ?? "Ein Fehler ist aufgetreten");
      setCreateLoading(false);
      return;
    }

    setCreateLoading(false);
    onComplete(); // Redirect to dashboard
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;

    setJoinError(null);
    setJoinLoading(true);

    const result = await joinTenant(selectedTenant.id, joinPassword);

    if (!result.success) {
      setJoinError(result.error ?? "Ein Fehler ist aufgetreten");
      setJoinLoading(false);
      return;
    }

    setJoinLoading(false);
    onComplete(); // Redirect to dashboard
  };

  const handleSearch = async (query: string) => {
    setJoinQuery(query);

    if (query.length < 2) {
      setJoinResults([]);
      return;
    }

    setSearching(true);
    const found = await searchTenants(query);
    setJoinResults(found);
    setSearching(false);
  };

  const slug = generateSlug(createName);

  if (mode === "create") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#003366] mb-2">
              Organisation erstellen 🏢
            </h1>
            <p className="text-gray-600">
              Erstelle deine eigene Organisation
            </p>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2 opacity-60">
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-semibold">
                  ✓
                </div>
                <span className="font-medium text-gray-500">Name</span>
              </div>
              <div className="flex items-center space-x-2 opacity-60">
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-semibold">
                  ✓
                </div>
                <span className="font-medium text-gray-500">Passwort</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-[#003366] text-white flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <span className="font-medium text-[#003366]">Organisation</span>
              </div>
            </div>
          </div>

          {createError && (
            <div className="bg-red-100 border border-red-400 rounded-md p-3 mb-4">
              <p className="text-sm text-red-800">{createError}</p>
            </div>
          )}

          <form onSubmit={handleCreateSubmit} className="space-y-6">
            <div>
              <label htmlFor="orgName" className="block text-sm font-bold text-gray-700 mb-2">
                Name der Organisation
              </label>
              <input
                type="text"
                id="orgName"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md text-base text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-[#003366] focus:border-transparent disabled:bg-gray-100"
                placeholder="z.B. Werderau Verein"
                required
                disabled={createLoading}
              />
              {slug && (
                <p className="text-gray-600 text-sm mt-1">URL: /{slug}</p>
              )}
            </div>

            <div>
              <label htmlFor="orgPassword" className="block text-sm font-bold text-gray-700 mb-2">
                Beitritts-Passwort
              </label>
              <input
                type="text"
                id="orgPassword"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md text-base text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-[#003366] focus:border-transparent disabled:bg-gray-100"
                placeholder="z.B. werderau2024"
                required
                disabled={createLoading}
              />
              <p className="text-gray-600 text-sm mt-1">
                Andere können mit diesem Passwort deiner Organisation beitreten.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setMode("choose")}
                disabled={createLoading}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-md font-bold hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Zurück
              </button>
              <button
                type="submit"
                disabled={createLoading}
                className="flex-1 bg-[#003366] text-white py-3 px-4 rounded-md font-bold hover:bg-[#004488] focus:outline-none focus:ring-2 focus:ring-[#003366] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {createLoading ? "Wird erstellt..." : "Erstellen"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (mode === "join") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#003366] mb-2">
              Organisation beitreten 🤝
            </h1>
            <p className="text-gray-600">
              Tritt einer bestehenden Organisation bei
            </p>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2 opacity-60">
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-semibold">
                  ✓
                </div>
                <span className="font-medium text-gray-500">Name</span>
              </div>
              <div className="flex items-center space-x-2 opacity-60">
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-semibold">
                  ✓
                </div>
                <span className="font-medium text-gray-500">Passwort</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-[#003366] text-white flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <span className="font-medium text-[#003366]">Organisation</span>
              </div>
            </div>
          </div>

          {joinError && (
            <div className="bg-red-100 border border-red-400 rounded-md p-3 mb-4">
              <p className="text-sm text-red-800">{joinError}</p>
            </div>
          )}

          {!selectedTenant ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="orgSearch" className="block text-sm font-bold text-gray-700 mb-2">
                  Organisation suchen
                </label>
                <input
                  type="text"
                  id="orgSearch"
                  value={joinQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md text-base text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                  placeholder="Name der Organisation eingeben..."
                />
              </div>

              {searching && (
                <p className="text-gray-600 text-sm">Suche...</p>
              )}

              {joinResults.length > 0 && (
                <div className="border border-gray-200 rounded-md overflow-hidden">
                  {joinResults.map((tenant) => (
                    <button
                      key={tenant.id}
                      onClick={() => setSelectedTenant(tenant)}
                      className="w-full p-3 text-left bg-white hover:bg-gray-50 border-b border-gray-200 last:border-b-0 cursor-pointer"
                    >
                      <span className="font-medium text-[#003366]">{tenant.name}</span>
                      <span className="text-gray-600 text-sm ml-2">/{tenant.slug}</span>
                    </button>
                  ))}
                </div>
              )}

              {joinQuery.length >= 2 && joinResults.length === 0 && !searching && (
                <p className="text-gray-600 text-sm">Keine Organisation gefunden.</p>
              )}

              <button
                onClick={() => setMode("choose")}
                className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-md font-bold hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
              >
                Zurück
              </button>
            </div>
          ) : (
            <form onSubmit={handleJoinSubmit} className="space-y-6">
              <div className="bg-gray-100 p-4 rounded-md flex justify-between items-center">
                <div>
                  <span className="font-bold text-[#003366]">{selectedTenant.name}</span>
                  <span className="text-gray-600 text-sm ml-2">/{selectedTenant.slug}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTenant(null)}
                  className="text-gray-600 hover:text-gray-800 bg-transparent border-none cursor-pointer text-sm"
                >
                  Ändern
                </button>
              </div>

              <div>
                <label htmlFor="joinPassword" className="block text-sm font-bold text-gray-700 mb-2">
                  Beitritts-Passwort
                </label>
                <input
                  type="password"
                  id="joinPassword"
                  value={joinPassword}
                  onChange={(e) => setJoinPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md text-base text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-[#003366] focus:border-transparent disabled:bg-gray-100"
                  placeholder="Passwort eingeben..."
                  required
                  disabled={joinLoading}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedTenant(null)}
                  disabled={joinLoading}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-md font-bold hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Zurück
                </button>
                <button
                  type="submit"
                  disabled={joinLoading}
                  className="flex-1 bg-[#003366] text-white py-3 px-4 rounded-md font-bold hover:bg-[#004488] focus:outline-none focus:ring-2 focus:ring-[#003366] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {joinLoading ? "Wird beigetreten..." : "Beitreten"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#003366] mb-2">
            Fast geschafft, {username}! 🎉
          </h1>
          <p className="text-gray-600">
            Erstelle eine Organisation oder tritt einer bei
          </p>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 opacity-60">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-semibold">
                ✓
              </div>
              <span className="font-medium text-gray-500">Name</span>
            </div>
            <div className="flex items-center space-x-2 opacity-60">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-semibold">
                ✓
              </div>
              <span className="font-medium text-gray-500">Passwort</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-[#003366] text-white flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <span className="font-medium text-[#003366]">Organisation</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => setMode("create")}
            className="w-full bg-[#003366] text-white py-4 px-6 rounded-md font-bold hover:bg-[#004488] focus:outline-none focus:ring-2 focus:ring-[#003366] focus:ring-offset-2 transition-colors text-left flex items-center justify-between"
          >
            <div>
              <div className="font-bold text-lg">Organisation erstellen</div>
              <div className="text-gray-200 text-sm">Starte deine eigene Organisation</div>
            </div>
            <div className="text-2xl">→</div>
          </button>

          <button
            onClick={() => setMode("join")}
            className="w-full bg-white border-2 border-[#003366] text-[#003366] py-4 px-6 rounded-md font-bold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#003366] focus:ring-offset-2 transition-colors text-left flex items-center justify-between"
          >
            <div>
              <div className="font-bold text-lg">Organisation beitreten</div>
              <div className="text-gray-600 text-sm">Tritt einer bestehenden Organisation bei</div>
            </div>
            <div className="text-2xl">→</div>
          </button>

          <button
            onClick={onBack}
            className="w-full mt-6 bg-gray-200 text-gray-700 py-3 px-4 rounded-md font-bold hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
          >
            Zurück
          </button>
        </div>
      </div>
    </div>
  );
}
