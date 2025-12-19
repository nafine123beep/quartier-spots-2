"use client";

import { useState, useEffect } from "react";
import { useFlohmarkt } from "../../FlohmarktContext";
import { Tenant } from "../../types";

interface JoinTenantFormProps {
  onBack: () => void;
}

export function JoinTenantForm({ onBack }: JoinTenantFormProps) {
  const { searchTenants, joinTenant } = useFlohmarkt();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  // Search tenants when query changes
  useEffect(() => {
    const search = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setSearching(true);
      const found = await searchTenants(query);
      setResults(found);
      setSearching(false);
    };

    const timeout = setTimeout(search, 300);
    return () => clearTimeout(timeout);
  }, [query, searchTenants]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;

    setError(null);
    setLoading(true);

    const result = await joinTenant(selectedTenant.id, password);

    if (!result.success) {
      setError(result.error ?? "Ein Fehler ist aufgetreten");
      setLoading(false);
      return;
    }

    setLoading(false);
    onBack();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-[500px] mx-auto">
      <button
        onClick={onBack}
        className="text-[#003366] mb-4 cursor-pointer bg-transparent border-none text-base hover:underline"
      >
        ← Zurück
      </button>

      <h2 className="text-[#003366] mt-0">Organisation beitreten</h2>
      <p className="text-gray-600 mb-5">
        Suche nach einer Organisation und tritt mit dem Passwort bei.
      </p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {!selectedTenant ? (
        <div>
          <div className="mb-4">
            <label className="block mb-1 font-bold text-gray-700 text-sm">
              Organisation suchen
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name der Organisation eingeben..."
              className="w-full p-3 border border-gray-300 rounded-md text-base text-gray-900 placeholder:text-gray-400"
            />
          </div>

          {searching && (
            <p className="text-gray-600 text-sm">Suche...</p>
          )}

          {results.length > 0 && (
            <div className="border border-gray-200 rounded-md overflow-hidden">
              {results.map((tenant) => (
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

          {query.length >= 2 && results.length === 0 && !searching && (
            <p className="text-gray-600 text-sm">Keine Organisation gefunden.</p>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="bg-gray-100 p-4 rounded-md mb-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-bold text-[#003366]">{selectedTenant.name}</span>
                <span className="text-gray-600 text-sm ml-2">/{selectedTenant.slug}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTenant(null)}
                className="text-gray-600 hover:text-gray-800 bg-transparent border-none cursor-pointer"
              >
                Ändern
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-bold text-gray-700 text-sm">
              Beitritts-Passwort
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Passwort eingeben..."
              required
              disabled={loading}
              className="w-full p-3 border border-gray-300 rounded-md text-base text-gray-900 placeholder:text-gray-400 disabled:bg-gray-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#003366] text-white p-3.5 border-none rounded-md text-lg font-bold mt-2 cursor-pointer hover:bg-[#002244] disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Wird beigetreten..." : "Beitreten"}
          </button>
        </form>
      )}
    </div>
  );
}
