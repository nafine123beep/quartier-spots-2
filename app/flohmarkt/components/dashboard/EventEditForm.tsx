"use client";

import { useState } from "react";
import { useFlohmarkt } from "../../FlohmarktContext";
import { TenantEvent } from "../../types";
import { geocodeAddress } from "../../lib/geocoding";
import { BOUNDARY_RADIUS_PRESETS } from "../../lib/geoUtils";

interface EventEditFormProps {
  event: TenantEvent;
  onSave: () => void;
  onCancel: () => void;
}

export function EventEditForm({ event, onSave, onCancel }: EventEditFormProps) {
  const { updateEvent } = useFlohmarkt();
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description || "");
  const [startsAt, setStartsAt] = useState(
    event.starts_at ? new Date(event.starts_at).toISOString().slice(0, 16) : ""
  );
  const [endsAt, setEndsAt] = useState(
    event.ends_at ? new Date(event.ends_at).toISOString().slice(0, 16) : ""
  );
  const [mapCenterAddress, setMapCenterAddress] = useState(event.map_center_address || "");
  const [enableBoundary, setEnableBoundary] = useState(!!event.boundary_radius_meters);
  const [boundaryRadius, setBoundaryRadius] = useState<number | null>(event.boundary_radius_meters ?? null);
  const [customRadius, setCustomRadius] = useState(
    event.boundary_radius_meters && !BOUNDARY_RADIUS_PRESETS.some(p => p.value === event.boundary_radius_meters)
      ? String(event.boundary_radius_meters)
      : ""
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      let mapCenterLat = event.map_center_lat;
      let mapCenterLng = event.map_center_lng;

      // If map center address changed, geocode it
      if (mapCenterAddress && mapCenterAddress !== event.map_center_address) {
        const geocodeResult = await geocodeAddress(mapCenterAddress);

        if (!geocodeResult) {
          setError("Adresse konnte nicht gefunden werden. Bitte überprüfe die Eingabe.");
          setSubmitting(false);
          return;
        }

        mapCenterLat = geocodeResult.lat;
        mapCenterLng = geocodeResult.lng;
      }

      // Ensure we have coordinates (either from geocoding or existing event)
      if (!mapCenterLat || !mapCenterLng) {
        setError("Bitte gib eine gültige Adresse für das Karten-Zentrum ein.");
        setSubmitting(false);
        return;
      }

      // Determine the final boundary radius
      const finalBoundaryRadius = enableBoundary ? boundaryRadius : null;

      const result = await updateEvent(event.id, {
        title,
        description,
        starts_at: startsAt || undefined,
        ends_at: endsAt || undefined,
        map_center_address: mapCenterAddress || undefined,
        map_center_lat: mapCenterLat,
        map_center_lng: mapCenterLng,
        boundary_radius_meters: finalBoundaryRadius,
      });

      if (result.success) {
        onSave();
      } else {
        setError(result.error || "Fehler beim Speichern");
      }
    } catch (err) {
      setError("Ein unerwarteter Fehler ist aufgetreten");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <h3 className="mt-0 mb-4 text-[#003366] text-xl font-bold">Event bearbeiten</h3>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block mb-2 font-bold text-gray-700 text-sm">
            Titel <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-md text-gray-900"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-bold text-gray-700 text-sm">
            Beschreibung
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-md text-gray-900 resize-y"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-2 font-bold text-gray-700 text-sm">
              Start
            </label>
            <input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md text-gray-900"
            />
          </div>
          <div>
            <label className="block mb-2 font-bold text-gray-700 text-sm">
              Ende
            </label>
            <input
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md text-gray-900"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-bold text-gray-700 text-sm">
            Karten-Zentrum (Adresse oder Stadtteil) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={mapCenterAddress}
            onChange={(e) => setMapCenterAddress(e.target.value)}
            placeholder="z.B. Werderau, Regensburg oder Genaue Straße 123"
            required
            className="w-full p-3 border border-gray-300 rounded-md text-gray-900"
          />
          <p className="mt-1 text-xs text-gray-600">
            Diese Adresse bestimmt den Mittelpunkt der Karte für Teilnehmer
          </p>
        </div>

        {/* Boundary Radius Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
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
              disabled={submitting}
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
                    disabled={submitting}
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
                  disabled={submitting}
                  className="w-32 p-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100"
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

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-[#003366] text-white px-6 py-3 rounded-md font-bold hover:bg-[#002244] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Wird gespeichert..." : "Speichern"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-md font-bold hover:bg-gray-400 disabled:opacity-50"
          >
            Abbrechen
          </button>
        </div>
      </form>
    </div>
  );
}
