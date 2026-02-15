"use client";

import { useState, useEffect, useRef } from "react";
import { useFlohmarkt } from "../../../../FlohmarktContext";
import { EventImage } from "../../../../types";
import { SPOT_TERM_PRESETS } from "../../../../lib/spotTerms";
import { BOUNDARY_RADIUS_PRESETS } from "../../../../lib/geoUtils";
import { EventImageUpload } from "../../../shared/EventImageUpload";
import { SaveStatusIndicator } from "../../../shared/SaveStatusIndicator";
import { useEventAutosave, type EventFormData } from "../../../../hooks/useEventAutosave";
import { MapPin, Calendar, Settings, ChevronDown, ChevronRight } from "lucide-react";

interface CreateStepProps {
  onNext: () => void;
  onUnsavedChanges: (hasChanges: boolean) => void;
  onSave?: (saveCallback: () => Promise<{ success: boolean; error?: string }>) => void;
}

export function CreateStep({ onNext, onUnsavedChanges, onSave }: CreateStepProps) {
  const { currentTenantEvent, updateEvent } = useFlohmarkt();

  // Form state
  const [title, setTitle] = useState(currentTenantEvent?.title || "");
  const [description, setDescription] = useState(currentTenantEvent?.description || "");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [mapCenterAddress, setMapCenterAddress] = useState(currentTenantEvent?.map_center_address || "");

  // Boundary
  const [enableBoundary, setEnableBoundary] = useState(!!currentTenantEvent?.boundary_radius_meters);
  const [boundaryRadius, setBoundaryRadius] = useState<number | null>(currentTenantEvent?.boundary_radius_meters || null);
  const [customRadius, setCustomRadius] = useState(
    currentTenantEvent?.boundary_radius_meters && !BOUNDARY_RADIUS_PRESETS.some(p => p.value === currentTenantEvent.boundary_radius_meters)
      ? String(currentTenantEvent.boundary_radius_meters)
      : ""
  );

  // Terminology
  const [enableCustomTerms, setEnableCustomTerms] = useState(false);
  const [selectedTermPreset, setSelectedTermPreset] = useState("Stand");
  const [customTermSingular, setCustomTermSingular] = useState("");
  const [customTermPlural, setCustomTermPlural] = useState("");

  // Images
  const [images, setImages] = useState<EventImage[]>(currentTenantEvent?.images ?? []);

  // Form data ref for autosave hook
  const formDataRef = useRef<EventFormData>({
    title: currentTenantEvent?.title || "",
    description: currentTenantEvent?.description || "",
    startsAt: "",
    endsAt: "",
    mapCenterAddress: currentTenantEvent?.map_center_address || "",
    boundaryRadius: currentTenantEvent?.boundary_radius_meters || null,
    spotTermSingular: currentTenantEvent?.spot_term_singular,
    spotTermPlural: currentTenantEvent?.spot_term_plural,
  });

  // Initialize autosave hook
  const { saveStatus, error: saveError, markDirty, save } = useEventAutosave({
    eventId: currentTenantEvent!.id,
    initialData: formDataRef.current,
    updateEvent,
  });

  // Convert UTC dates to local datetime-local format
  useEffect(() => {
    if (currentTenantEvent?.starts_at) {
      const date = new Date(currentTenantEvent.starts_at);
      setStartsAt(formatDateTimeLocal(date));
    }
    if (currentTenantEvent?.ends_at) {
      const date = new Date(currentTenantEvent.ends_at);
      setEndsAt(formatDateTimeLocal(date));
    }
  }, [currentTenantEvent?.starts_at, currentTenantEvent?.ends_at]);

  // Detect custom terms
  useEffect(() => {
    if (currentTenantEvent?.spot_term_singular) {
      const preset = SPOT_TERM_PRESETS.find(
        (p) => p.singular === currentTenantEvent.spot_term_singular
      );
      if (preset) {
        setSelectedTermPreset(preset.singular);
        setEnableCustomTerms(true);
      } else {
        setSelectedTermPreset("custom");
        setCustomTermSingular(currentTenantEvent.spot_term_singular);
        setCustomTermPlural(currentTenantEvent.spot_term_plural || "");
        setEnableCustomTerms(true);
      }
    }
  }, [currentTenantEvent?.spot_term_singular, currentTenantEvent?.spot_term_plural]);

  // Track unsaved changes
  useEffect(() => {
    const hasChanges =
      title !== (currentTenantEvent?.title || "") ||
      description !== (currentTenantEvent?.description || "");
    onUnsavedChanges(hasChanges);
  }, [title, description, currentTenantEvent, onUnsavedChanges]);

  const formatDateTimeLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Validation function for navigation
  const validateForm = (): { valid: boolean; error?: string } => {
    if (!title.trim()) {
      return { valid: false, error: "Bitte gib einen Titel ein" };
    }
    if (!startsAt || !endsAt) {
      return { valid: false, error: "Bitte gib Start- und Enddatum ein" };
    }
    if (!mapCenterAddress.trim()) {
      return { valid: false, error: "Bitte gib eine Adresse für das Kartenzentrum ein" };
    }
    return { valid: true };
  };

  // Update formDataRef when state changes
  useEffect(() => {
    // Prepare term values
    let spotTermSingular: string | undefined;
    let spotTermPlural: string | undefined;

    if (enableCustomTerms) {
      if (selectedTermPreset === "custom") {
        spotTermSingular = customTermSingular || undefined;
        spotTermPlural = customTermPlural || undefined;
      } else {
        const preset = SPOT_TERM_PRESETS.find((p) => p.singular === selectedTermPreset);
        if (preset) {
          spotTermSingular = preset.singular;
          spotTermPlural = preset.plural;
        }
      }
    }

    formDataRef.current = {
      title,
      description,
      startsAt,
      endsAt,
      mapCenterAddress,
      boundaryRadius: enableBoundary ? boundaryRadius : null,
      spotTermSingular,
      spotTermPlural,
    };
  }, [
    title,
    description,
    startsAt,
    endsAt,
    mapCenterAddress,
    enableBoundary,
    boundaryRadius,
    enableCustomTerms,
    selectedTermPreset,
    customTermSingular,
    customTermPlural,
  ]);

  // Expose save callback to parent for navigation
  useEffect(() => {
    if (onSave) {
      onSave(async () => {
        const validation = validateForm();
        if (!validation.valid) {
          return { success: false, error: validation.error };
        }
        return save({ immediate: true, validate: true });
      });
    }
  }, [onSave, save, title, startsAt, endsAt, mapCenterAddress]);

  return (
    <div className="space-y-6">
      {/* Title & Description */}
      <div className="bg-white rounded-lg shadow-sm p-5">
        <h2 className="text-lg font-bold text-[#003366] mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Grunddaten
        </h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Titel der Veranstaltung <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                markDirty("title");
              }}
              onBlur={() => save({ immediate: true })}
              placeholder="z.B. Hinterhof-Flohmarkt Kreuzberg"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Beschreibung
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                markDirty("description");
              }}
              onBlur={() => save({ immediate: true })}
              placeholder="Beschreibe dein Event kurz..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent resize-y"
            />
          </div>
        </div>
      </div>

      {/* Photos — same component as EventEditForm */}
      <EventImageUpload
        eventId={currentTenantEvent!.id}
        images={images}
        onImagesChange={setImages}
      />

      {/* Date/Time */}
      <div className="bg-white rounded-lg shadow-sm p-5">
        <h2 className="text-lg font-bold text-[#003366] mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Datum und Uhrzeit
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startsAt" className="block text-sm font-medium text-gray-700 mb-1">
              Start <span className="text-red-500">*</span>
            </label>
            <input
              id="startsAt"
              type="datetime-local"
              value={startsAt}
              onChange={(e) => {
                setStartsAt(e.target.value);
                markDirty("startsAt");
                save({ immediate: true });
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="endsAt" className="block text-sm font-medium text-gray-700 mb-1">
              Ende <span className="text-red-500">*</span>
            </label>
            <input
              id="endsAt"
              type="datetime-local"
              value={endsAt}
              onChange={(e) => {
                setEndsAt(e.target.value);
                markDirty("endsAt");
                save({ immediate: true });
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-white rounded-lg shadow-sm p-5">
        <h2 className="text-lg font-bold text-[#003366] mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Standort
        </h2>

        <div>
          <label htmlFor="mapCenterAddress" className="block text-sm font-medium text-gray-700 mb-1">
            Karten-Zentrum (Adresse) <span className="text-red-500">*</span>
          </label>
          <input
            id="mapCenterAddress"
            type="text"
            value={mapCenterAddress}
            onChange={(e) => {
              setMapCenterAddress(e.target.value);
              markDirty("mapCenterAddress");
            }}
            onBlur={() => save({ immediate: true })}
            placeholder="z.B. Oranienstraße 25, Berlin"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Diese Adresse bestimmt den Mittelpunkt der Karte für Teilnehmer.
          </p>
        </div>
      </div>

      {/* Boundary radius — card pattern from EventEditForm */}
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => {
            setEnableBoundary(!enableBoundary);
            if (enableBoundary) {
              setBoundaryRadius(null);
              setCustomRadius("");
            }
            markDirty("boundaryRadius");
            save({ immediate: true });
          }}
          className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
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

        {/* Description — always visible */}
        <div className="px-3 py-2 bg-white border-t border-gray-100">
          <p className="text-xs text-gray-500 m-0">
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
                    markDirty("boundaryRadius");
                    save({ immediate: true });
                  }}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    boundaryRadius === preset.value
                      ? "bg-[#003366] text-white"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setBoundaryRadius(null);
                  setCustomRadius("");
                  markDirty("boundaryRadius");
                  save({ immediate: true });
                }}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  boundaryRadius === null && customRadius === ""
                    ? "bg-[#003366] text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
              >
                Ohne Limit
              </button>
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
                  if (value > 0) {
                    setBoundaryRadius(value);
                  } else {
                    setBoundaryRadius(null);
                  }
                  markDirty("boundaryRadius");
                }}
                onBlur={() => save({ immediate: true })}
                placeholder="z.B. 50"
                className="w-32 p-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder:text-gray-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Terminology — card pattern from EventEditForm */}
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => {
            setEnableCustomTerms(!enableCustomTerms);
            if (enableCustomTerms) {
              setSelectedTermPreset("Stand");
              setCustomTermSingular("");
              setCustomTermPlural("");
              markDirty("spotTermSingular");
              markDirty("spotTermPlural");
              save({ immediate: true });
            }
          }}
          className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
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

        {/* Description — always visible */}
        <div className="px-3 py-2 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-600 m-0">
            Dein Event wird aus mehreren &quot;Spots&quot; bestehen – das sind die Orte, an denen Teilnehmende aktiv sind.
          </p>
        </div>

        {enableCustomTerms && (
          <div className="p-4 border-t border-gray-200">
            <p className="text-xs text-gray-600 mb-3">
              Wähle z.B. &quot;Stand&quot; für Flohmärkte, &quot;Spielort&quot; oder &quot;Bühne&quot; für Musik-/Kulturveranstaltungen, &quot;Checkpoint&quot; für Rallyes oder eine eigene Bezeichnung.
            </p>
            <select
              value={selectedTermPreset}
              onChange={(e) => {
                setSelectedTermPreset(e.target.value);
                if (e.target.value !== "custom") {
                  setCustomTermSingular("");
                  setCustomTermPlural("");
                }
                markDirty("spotTermSingular");
                markDirty("spotTermPlural");
                save({ immediate: true });
              }}
              className="w-full p-2.5 border border-gray-300 rounded-md text-sm text-gray-900 bg-white"
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
                    value={customTermSingular}
                    onChange={(e) => {
                      setCustomTermSingular(e.target.value);
                      markDirty("spotTermSingular");
                    }}
                    onBlur={() => save({ immediate: true })}
                    placeholder="z.B. Platz"
                    className="w-full p-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder:text-gray-400"
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 text-xs text-gray-600">
                    Plural
                  </label>
                  <input
                    type="text"
                    value={customTermPlural}
                    onChange={(e) => {
                      setCustomTermPlural(e.target.value);
                      markDirty("spotTermPlural");
                    }}
                    onBlur={() => save({ immediate: true })}
                    placeholder="z.B. Plätze"
                    className="w-full p-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Save status indicator */}
      <SaveStatusIndicator status={saveStatus} error={saveError} />
    </div>
  );
}
