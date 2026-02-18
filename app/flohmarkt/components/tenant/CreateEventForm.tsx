"use client";

import { useState } from "react";
import { useFlohmarkt } from "../../FlohmarktContext";
import { geocodeAddress } from "../../lib/geocoding";
import { BOUNDARY_RADIUS_PRESETS } from "../../lib/geoUtils";
import { SPOT_TERM_PRESETS } from "../../lib/spotTerms";
import { ChevronDown, ChevronRight } from "lucide-react";

interface CreateEventFormProps {
  onSuccess: (event: { id: string; title: string; slug: string }) => void;
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
  const [enableCustomTerms, setEnableCustomTerms] = useState(false);
  const [selectedTermPreset, setSelectedTermPreset] = useState("Stand");
  const [spotTermSingular, setSpotTermSingular] = useState("");
  const [spotTermPlural, setSpotTermPlural] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Inline date validation errors
  const [startDateError, setStartDateError] = useState<string | null>(null);
  const [endDateError, setEndDateError] = useState<string | null>(null);

  const validateDates = (start: string, end: string) => {
    let startErr: string | null = null;
    let endErr: string | null = null;
    const now = new Date();

    if (start) {
      const startDate = new Date(start);
      if (!isNaN(startDate.getTime()) && startDate <= now) {
        startErr = "Das Startdatum muss in der Zukunft liegen";
      }
    }

    if (end) {
      const endDate = new Date(end);
      if (start) {
        const startDate = new Date(start);
        if (!isNaN(endDate.getTime()) && !isNaN(startDate.getTime()) && endDate <= startDate) {
          endErr = "Das Enddatum muss nach dem Startdatum liegen";
        }
      }
      if (!isNaN(endDate.getTime()) && endDate <= now) {
        endErr = endErr || "Das Enddatum muss in der Zukunft liegen";
      }
    }

    setStartDateError(startErr);
    setEndDateError(endErr);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate dates before submission
    if (!startsAt || !endsAt) {
      setError("Bitte gib Start- und Enddatum ein.");
      return;
    }
    const startDate = new Date(startsAt);
    const endDate = new Date(endsAt);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      setError("Ungültiges Datum. Bitte überprüfe die Eingabe.");
      return;
    }
    if (startDate <= new Date()) {
      setError("Das Startdatum muss in der Zukunft liegen.");
      return;
    }
    if (endDate <= startDate) {
      setError("Das Enddatum muss nach dem Startdatum liegen.");
      return;
    }
    if (endDate <= new Date()) {
      setError("Das Enddatum muss in der Zukunft liegen.");
      return;
    }

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

    // Determine spot terminology
    let finalSingular: string | undefined;
    let finalPlural: string | undefined;

    if (enableCustomTerms) {
      if (selectedTermPreset === "custom") {
        finalSingular = spotTermSingular || undefined;
        finalPlural = spotTermPlural || undefined;
      } else {
        const preset = SPOT_TERM_PRESETS.find(p => p.singular === selectedTermPreset);
        if (preset) {
          finalSingular = preset.singular;
          finalPlural = preset.plural;
        }
      }
    }

    const result = await createTenantEvent(
      title,
      description,
      startsAt,
      endsAt,
      mapCenterAddress,
      geocodeResult.lat,
      geocodeResult.lng,
      finalBoundaryRadius,
      finalSingular,
      finalPlural
    );

    if (!result.success) {
      setError(result.error ?? "Ein Fehler ist aufgetreten");
      setLoading(false);
      return;
    }

    setLoading(false);
    if (result.event) {
      onSuccess(result.event);
    }
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

        {/* Event Photos Info */}
        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Tipp:</strong> Fotos kannst du nach dem Erstellen des Events hinzufügen.
          </p>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 mb-4">
            <label className="block mb-1 font-bold text-gray-700 text-sm">
              Start *
            </label>
            <input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => {
                setStartsAt(e.target.value);
                validateDates(e.target.value, endsAt);
              }}
              disabled={loading}
              className={`w-full p-3 rounded-md text-base text-gray-900 placeholder:text-gray-400 disabled:bg-gray-100 ${
                startDateError ? "border-2 border-red-500" : "border border-gray-300"
              }`}
            />
            {startDateError && (
              <p className="text-xs text-red-600 mt-1">{startDateError}</p>
            )}
          </div>
          <div className="flex-1 mb-4">
            <label className="block mb-1 font-bold text-gray-700 text-sm">
              Ende *
            </label>
            <input
              type="datetime-local"
              value={endsAt}
              onChange={(e) => {
                setEndsAt(e.target.value);
                validateDates(startsAt, e.target.value);
              }}
              disabled={loading}
              className={`w-full p-3 rounded-md text-base text-gray-900 placeholder:text-gray-400 disabled:bg-gray-100 ${
                endDateError ? "border-2 border-red-500" : "border border-gray-300"
              }`}
            />
            {endDateError && (
              <p className="text-xs text-red-600 mt-1">{endDateError}</p>
            )}
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
        <div className="mb-4 border border-gray-300 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => {
              setEnableBoundary(!enableBoundary);
              if (enableBoundary) {
                setBoundaryRadius(null);
                setCustomRadius("");
              }
            }}
            disabled={loading}
            className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <span className="text-sm font-medium text-gray-700">
              Geografisches Gebiet einschränken
            </span>
            {enableBoundary ? (
              <ChevronDown className="h-5 w-5 text-gray-500" aria-hidden="true" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-500" aria-hidden="true" />
            )}
          </button>

          {/* Description - Always visible */}
          <div className="px-3 py-2 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-600 m-0">
              Spots können nur innerhalb des festgelegten Radius vom Karten-Zentrum erstellt werden.
            </p>
          </div>

          {enableBoundary && (
            <div className="p-4 border-t border-gray-200">
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
              {!boundaryRadius && (
                <p className="mt-2 text-xs text-orange-600">
                  Bitte wähle einen Radius aus oder gib einen eigenen Wert ein (min. 100m).
                </p>
              )}
            </div>
          )}
        </div>

        {/* Spot Terminology Section */}
        <div className="mb-4 border border-gray-300 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => {
              setEnableCustomTerms(!enableCustomTerms);
              if (enableCustomTerms) {
                setSelectedTermPreset("Stand");
                setSpotTermSingular("");
                setSpotTermPlural("");
              }
            }}
            disabled={loading}
            className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <span className="text-sm font-medium text-gray-700">
              Bezeichnung für &quot;Spots&quot; anpassen
            </span>
            {enableCustomTerms ? (
              <ChevronDown className="h-5 w-5 text-gray-500" aria-hidden="true" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-500" aria-hidden="true" />
            )}
          </button>

          {/* Description - Always visible */}
          <div className="px-3 py-2 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-600 m-0">
              Dein Event wird aus mehreren &quot;Spots&quot; bestehen – das sind die Orte, an denen Teilnehmende aktiv sind. Wähle hier die Bezeichnung, die zu deinem Event passt.
            </p>
          </div>

          {enableCustomTerms && (
            <div className="p-4 border-t border-gray-200">
              <p className="text-xs text-gray-600 mb-3">
                Passe die Bezeichnung an dein Event an, wähle z.B. &quot;Stand&quot; für Flohmärkte, &quot;Spielort&quot; oder &quot;Bühne&quot; für Musik-/Kulturveranstaltungen, &quot;Checkpoint&quot; für Radtouren, Rallyes etc.
              </p>
              <select
                value={selectedTermPreset}
                onChange={(e) => {
                  setSelectedTermPreset(e.target.value);
                  if (e.target.value !== "custom") {
                    setSpotTermSingular("");
                    setSpotTermPlural("");
                  }
                }}
                disabled={loading}
                className="w-full p-2.5 border border-gray-300 rounded-md text-sm text-gray-900 bg-white disabled:bg-gray-100"
              >
                {SPOT_TERM_PRESETS.slice(1).map((preset) => (
                  <option key={preset.singular} value={preset.singular}>
                    {preset.singular}
                  </option>
                ))}
                <option value="custom">Eigene Bezeichnung...</option>
              </select>

              {selectedTermPreset === "custom" && (
                <div className="flex gap-4 mt-3 pt-3 border-t border-gray-200">
                  <div className="flex-1">
                    <label className="block mb-1 text-xs text-gray-600">
                      Singular
                    </label>
                    <input
                      type="text"
                      value={spotTermSingular}
                      onChange={(e) => setSpotTermSingular(e.target.value)}
                      placeholder="z.B. Teilnehmer"
                      disabled={loading}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder:text-gray-400 disabled:bg-gray-100"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block mb-1 text-xs text-gray-600">
                      Plural
                    </label>
                    <input
                      type="text"
                      value={spotTermPlural}
                      onChange={(e) => setSpotTermPlural(e.target.value)}
                      placeholder="z.B. Teilnehmer"
                      disabled={loading}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder:text-gray-400 disabled:bg-gray-100"
                    />
                  </div>
                </div>
              )}
            </div>
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
