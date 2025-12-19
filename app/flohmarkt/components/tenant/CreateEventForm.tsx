"use client";

import { useState } from "react";
import { useFlohmarkt } from "../../FlohmarktContext";

interface CreateEventFormProps {
  onSuccess: () => void;
}

export function CreateEventForm({ onSuccess }: CreateEventFormProps) {
  const { createTenantEvent } = useFlohmarkt();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await createTenantEvent(title, description, startsAt, endsAt);

    if (!result.success) {
      setError(result.error ?? "Ein Fehler ist aufgetreten");
      setLoading(false);
      return;
    }

    setLoading(false);
    onSuccess();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-[600px] mx-auto">
      <h2 className="text-[#003366] mt-0">Neues Event anlegen</h2>
      <p className="text-gray-600 mb-5">
        Trage hier die Eckdaten für deine Veranstaltung ein.
      </p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1 font-bold text-gray-600 text-sm">
            Titel der Veranstaltung *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="z.B. Hof-Flohmarkt im Neuen Quartier"
            required
            disabled={loading}
            className="w-full p-3 border border-gray-300 rounded-md text-base disabled:bg-gray-100"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-bold text-gray-600 text-sm">
            Beschreibung
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional: Weitere Infos zum Event..."
            disabled={loading}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-md text-base disabled:bg-gray-100 resize-vertical"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1 mb-4">
            <label className="block mb-1 font-bold text-gray-600 text-sm">
              Start
            </label>
            <input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              disabled={loading}
              className="w-full p-3 border border-gray-300 rounded-md text-base disabled:bg-gray-100"
            />
          </div>
          <div className="flex-1 mb-4">
            <label className="block mb-1 font-bold text-gray-600 text-sm">
              Ende
            </label>
            <input
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              disabled={loading}
              className="w-full p-3 border border-gray-300 rounded-md text-base disabled:bg-gray-100"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#003366] text-white p-3.5 border-none rounded-md text-lg font-bold mt-2 cursor-pointer hover:bg-[#002244] disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Wird erstellt..." : "Event erstellen"}
        </button>
      </form>
    </div>
  );
}
