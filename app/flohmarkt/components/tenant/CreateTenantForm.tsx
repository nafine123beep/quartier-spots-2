"use client";

import { useState } from "react";
import { useFlohmarkt } from "../../FlohmarktContext";

interface CreateTenantFormProps {
  onBack: () => void;
}

export function CreateTenantForm({ onBack }: CreateTenantFormProps) {
  const { createTenant } = useFlohmarkt();
  const [name, setName] = useState("");
  const [joinPassword, setJoinPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await createTenant(name, joinPassword);

    if (!result.success) {
      setError(result.error ?? "Ein Fehler ist aufgetreten");
      setLoading(false);
      return;
    }

    setLoading(false);
    onBack();
  };

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-[500px] mx-auto">
      <button
        onClick={onBack}
        className="text-[#003366] mb-4 cursor-pointer bg-transparent border-none text-base hover:underline"
      >
        ← Zurück
      </button>

      <h2 className="text-[#003366] mt-0">Neue Organisation erstellen</h2>
      <p className="text-gray-600 mb-5">
        Erstelle eine Organisation, um Events zu verwalten und Mitglieder einzuladen.
      </p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1 font-bold text-gray-700 text-sm">
            Name der Organisation
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="z.B. Werderau Verein"
            required
            disabled={loading}
            className="w-full p-3 border border-gray-300 rounded-md text-base text-gray-900 placeholder:text-gray-400 disabled:bg-gray-100"
          />
          {slug && (
            <p className="text-gray-600 text-sm mt-1">URL: /{slug}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-bold text-gray-700 text-sm">
            Beitritts-Passwort
          </label>
          <input
            type="text"
            value={joinPassword}
            onChange={(e) => setJoinPassword(e.target.value)}
            placeholder="z.B. werderau2024"
            required
            disabled={loading}
            className="w-full p-3 border border-gray-300 rounded-md text-base text-gray-900 placeholder:text-gray-400 disabled:bg-gray-100"
          />
          <p className="text-gray-600 text-sm mt-1">
            Andere können mit diesem Passwort deiner Organisation beitreten.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#003366] text-white p-3.5 border-none rounded-md text-lg font-bold mt-2 cursor-pointer hover:bg-[#002244] disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Wird erstellt..." : "Organisation erstellen"}
        </button>
      </form>
    </div>
  );
}
