"use client";

import { useState } from "react";
import { useFlohmarkt } from "../../FlohmarktContext";
import { TenantEvent } from "../../types";
import { geocodeAddress } from "../../lib/geocoding";

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

      const result = await updateEvent(event.id, {
        title,
        description,
        starts_at: startsAt || undefined,
        ends_at: endsAt || undefined,
        map_center_address: mapCenterAddress || undefined,
        map_center_lat: mapCenterLat,
        map_center_lng: mapCenterLng,
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

        <div className="mb-6">
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
