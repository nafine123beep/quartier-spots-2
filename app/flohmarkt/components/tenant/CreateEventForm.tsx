"use client";

import { useState } from "react";
import { useFlohmarkt } from "../../FlohmarktContext";
import { geocodeAddress } from "../../lib/geocoding";
import { BOUNDARY_RADIUS_PRESETS } from "../../lib/geoUtils";

interface CreateEventFormProps {
  onSuccess: () => void;
}

export function CreateEventForm({ onSuccess }: CreateEventFormProps) {
  const { createTenantEvent } = useFlohmarkt();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [mapCenterAddress, setMapCenterAddress] = useState("");
  const [enableBoundary, setEnableBoundary] = useState(false);
  const [boundaryRadius, setBoundaryRadius] = useState<number | null>(null);
  const [customRadius, setCustomRadius] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Geocode the map center address
    const geocodeResult = await geocodeAddress(mapCenterAddress);

    if (!geocodeResult) {
      setError("Adresse konnte nicht gefunden werden. Bitte überprüfe die Eingabe.");
      setLoading(false);
      return;
    }

    // Determine the final boundary radius
    const finalBoundaryRadius = enableBoundary ? boundaryRadius : null;

    const result = await createTenantEvent(
      title,
      description,
      startsAt,
      endsAt,
      mapCenterAddress,
      geocodeResult.lat,
      geocodeResult.lng,
      finalBoundaryRadius
    );

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
          <label className="block mb-1 font-bold text-gray-700 text-sm">
            Titel der Veranstaltung *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="z.B. Hof-Flohmarkt im Neuen Quartier"
            required
            disabled={loading}
            className="w-full p-3 border border-gray-300 rounded-md text-base text-gray-900 placeholder:text-gray-400 disabled:bg-gray-100"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-bold text-gray-700 text-sm">
            Beschreibung
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional: Weitere Infos zum Event..."
            disabled={loading}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-md text-base text-gray-900 placeholder:text-gray-400 disabled:bg-gray-100 resize-vertical"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1 mb-4">
            <label className="block mb-1 font-bold text-gray-700 text-sm">
              Start
            </label>
            <input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              disabled={loading}
              className="w-full p-3 border border-gray-300 rounded-md text-base text-gray-900 placeholder:text-gray-400 disabled:bg-gray-100"
            />
          </div>
          <div className="flex-1 mb-4">
            <label className="block mb-1 font-bold text-gray-700 text-sm">
              Ende
            </label>
            <input
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              disabled={loading}
              className="w-full p-3 border border-gray-300 rounded-md text-base text-gray-900 placeholder:text-gray-400 disabled:bg-gray-100"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-bold text-gray-700 text-sm">
            Karten-Zentrum (Adresse oder Stadtteil) *
          </label>
          <input
            type="text"
            value={mapCenterAddress}
            onChange={(e) => setMapCenterAddress(e.target.value)}
            placeholder="z.B. Werderau, Regensburg oder Genaue Straße 123"
            required
            disabled={loading}
            className="w-full p-3 border border-gray-300 rounded-md text-base text-gray-900 placeholder:text-gray-400 disabled:bg-gray-100"
          />
          <p className="mt-1 text-xs text-gray-600">
            Diese Adresse bestimmt den Mittelpunkt der Karte für Teilnehmer
          </p>
        </div>

        {/* Boundary Radius Section */}
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-start gap-2.5 mb-3">
            <input
              type="checkbox"
              id="enableBoundary"
              checked={enableBoundary}
              onChange={(e) => {
                setEnableBoundary(e.target.checked);
                if (!e.target.checked) {
                  setBoundaryRadius(null);
                  setCustomRadius("");
                }
              }}
              disabled={loading}
              className="w-5 h-5 mt-0.5"
            />
            <label htmlFor="enableBoundary" className="font-bold text-gray-700 text-sm">
              Geografisches Gebiet einschränken
            </label>
          </div>

          {enableBoundary && (
            <>
              <p className="text-xs text-gray-600 mb-3">
                Spots können nur innerhalb des festgelegten Radius vom Karten-Zentrum erstellt werden.
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {BOUNDARY_RADIUS_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => {
                      setBoundaryRadius(preset.value);
                      setCustomRadius("");
                    }}
                    disabled={loading}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      boundaryRadius === preset.value
                        ? "bg-[#003366] text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                    } disabled:opacity-50`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <div>
                <label className="block mb-1 text-xs text-gray-600">
                  Oder eigenen Radius eingeben (in Metern):
                </label>
                <input
                  type="number"
                  value={customRadius}
                  onChange={(e) => {
                    setCustomRadius(e.target.value);
                    const value = parseInt(e.target.value);
                    if (value >= 100) {
                      setBoundaryRadius(value);
                    } else {
                      setBoundaryRadius(null);
                    }
                  }}
                  placeholder="z.B. 750"
                  min="100"
                  max="50000"
                  disabled={loading}
                  className="w-32 p-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder:text-gray-500 disabled:bg-gray-100"
                />
              </div>
              {enableBoundary && !boundaryRadius && (
                <p className="mt-2 text-xs text-orange-600">
                  Bitte wähle einen Radius aus oder gib einen eigenen Wert ein (min. 100m).
                </p>
              )}
            </>
          )}
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
