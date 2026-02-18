"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { geocodeAddress, type GeocodeResult } from "@/app/flohmarkt/lib/geocoding";

export type SaveStatus = "saved" | "saving" | "unsaved" | "error";

export interface EventFormData {
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  mapCenterAddress: string;
  boundaryRadius: number | null;
  spotTermSingular?: string;
  spotTermPlural?: string;
}

export interface UseEventAutosaveOptions {
  eventId: string;
  initialData: EventFormData;
  updateEvent: (
    eventId: string,
    data: Record<string, unknown>
  ) => Promise<{ success: boolean; error?: string }>;
}

export interface UseEventAutosaveReturn {
  saveStatus: SaveStatus;
  error: string | null;
  markDirty: (field: keyof EventFormData) => void;
  updateFormData: (data: EventFormData) => void;
  save: (options?: {
    immediate?: boolean;
    validate?: boolean;
  }) => Promise<{ success: boolean; error?: string }>;
  reset: () => void;
}

export function useEventAutosave({
  eventId,
  initialData,
  updateEvent,
}: UseEventAutosaveOptions): UseEventAutosaveReturn {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [error, setError] = useState<string | null>(null);
  const [dirtyFields, setDirtyFields] = useState<Set<keyof EventFormData>>(new Set());

  // Refs for optimization
  const saveQueue = useRef<Promise<{ success: boolean; error?: string }>>(
    Promise.resolve({ success: true })
  );
  const lastGeocodedAddress = useRef<string | null>(null);
  const lastGeocodedResult = useRef<GeocodeResult | null>(null);
  const currentFormData = useRef<EventFormData>(initialData);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const dirtyFieldsRef = useRef<Set<keyof EventFormData>>(new Set());

  // Mark a field as dirty (updates both ref and state)
  const markDirty = useCallback((field: keyof EventFormData) => {
    dirtyFieldsRef.current = new Set([...dirtyFieldsRef.current, field]);
    setDirtyFields(new Set(dirtyFieldsRef.current));
    setSaveStatus("unsaved");
  }, []);

  // Update current form data (called from parent)
  const updateFormData = useCallback((data: EventFormData) => {
    currentFormData.current = data;
  }, []);

  // Save function with queuing
  const save = useCallback(
    async (
      options: { immediate?: boolean; validate?: boolean } = {}
    ): Promise<{ success: boolean; error?: string }> => {
      const { immediate = false, validate = false } = options;

      // If no dirty fields and not forced, skip save
      if (dirtyFieldsRef.current.size === 0 && !validate) {
        return { success: true };
      }

      // Cancel any pending debounced save
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
        debounceTimeout.current = null;
      }

      // Queue the save to prevent race conditions
      const savePromise = saveQueue.current.then(async () => {
        setSaveStatus("saving");
        setError(null);

        try {
          const formData = currentFormData.current;

          // Geocode address if it changed
          let geocodeResult = lastGeocodedResult.current;
          const addressChanged = formData.mapCenterAddress !== lastGeocodedAddress.current;

          if (addressChanged && formData.mapCenterAddress.trim()) {
            try {
              const result = await geocodeAddress(formData.mapCenterAddress);
              if (result) {
                geocodeResult = result;
                lastGeocodedAddress.current = formData.mapCenterAddress;
                lastGeocodedResult.current = result;
              } else {
                // Geocoding failed
                if (validate) {
                  // For validation (navigation), geocoding failure is blocking
                  setSaveStatus("error");
                  setError("Adresse konnte nicht gefunden werden. Bitte überprüfe die Eingabe.");
                  return { success: false, error: "Adresse konnte nicht gefunden werden" };
                } else {
                  // For autosave, just log and continue with old coordinates
                  console.warn("Geocoding failed during autosave, keeping old coordinates");
                }
              }
            } catch (geocodeError) {
              console.error("Geocoding error:", geocodeError);
              if (validate) {
                setSaveStatus("error");
                setError("Fehler beim Geocoding");
                return { success: false, error: "Fehler beim Geocoding" };
              }
            }
          }

          // Prepare update data with validation
          const updateData: Record<string, unknown> = {
            title: formData.title.trim(),
            description: formData.description.trim() || undefined,
            map_center_address: formData.mapCenterAddress.trim(),
            boundary_radius_meters: formData.boundaryRadius,
            spot_term_singular: formData.spotTermSingular,
            spot_term_plural: formData.spotTermPlural,
          };

          // Parse and validate date fields
          let startDate: Date | null = null;
          let endDate: Date | null = null;

          if (formData.startsAt && formData.startsAt.trim()) {
            startDate = new Date(formData.startsAt);
            if (!isNaN(startDate.getTime())) {
              updateData.starts_at = startDate.toISOString();
            } else {
              console.warn("useEventAutosave: Invalid start date:", formData.startsAt);
              startDate = null;
            }
          }

          if (formData.endsAt && formData.endsAt.trim()) {
            endDate = new Date(formData.endsAt);
            if (!isNaN(endDate.getTime())) {
              updateData.ends_at = endDate.toISOString();
            } else {
              console.warn("useEventAutosave: Invalid end date:", formData.endsAt);
              endDate = null;
            }
          }

          // Validation checks when navigating (validate=true)
          if (validate) {
            if (!startDate || !endDate) {
              setSaveStatus("error");
              const msg = "Bitte gib Start- und Enddatum ein";
              setError(msg);
              return { success: false, error: msg };
            }
            const now = new Date();
            if (startDate <= now) {
              setSaveStatus("error");
              const msg = "Das Startdatum muss in der Zukunft liegen";
              setError(msg);
              return { success: false, error: msg };
            }
            if (endDate <= startDate) {
              setSaveStatus("error");
              const msg = "Das Enddatum muss nach dem Startdatum liegen";
              setError(msg);
              return { success: false, error: msg };
            }
            if (endDate <= now) {
              setSaveStatus("error");
              const msg = "Das Enddatum muss in der Zukunft liegen";
              setError(msg);
              return { success: false, error: msg };
            }
          }

          // Include geocoding results if available
          if (geocodeResult) {
            updateData.map_center_lat = geocodeResult.lat;
            updateData.map_center_lng = geocodeResult.lng;
          }

          // Call updateEvent
          const result = await updateEvent(eventId, updateData);

          if (result.success) {
            setSaveStatus("saved");
            setError(null);
            dirtyFieldsRef.current = new Set();
            setDirtyFields(new Set());

            // Auto-hide "saved" status after 3 seconds
            setTimeout(() => {
              setSaveStatus((current) => (current === "saved" ? "saved" : current));
            }, 3000);

            return { success: true };
          } else {
            setSaveStatus("error");
            setError(result.error || "Fehler beim Speichern");
            return { success: false, error: result.error || "Fehler beim Speichern" };
          }
        } catch (err) {
          console.error("Save error:", err);
          setSaveStatus("error");
          setError("Ein Fehler ist aufgetreten");
          return { success: false, error: "Ein Fehler ist aufgetreten" };
        }
      });

      saveQueue.current = savePromise;
      return savePromise;
    },
    [eventId, updateEvent]
  );

  // Reset state
  const reset = useCallback(() => {
    dirtyFieldsRef.current = new Set();
    setDirtyFields(new Set());
    setSaveStatus("saved");
    setError(null);
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
      debounceTimeout.current = null;
    }
  }, []);

  // Debounced autosave effect
  useEffect(() => {
    if (dirtyFields.size === 0) return;

    // Set up debounced save
    debounceTimeout.current = setTimeout(() => {
      save({ immediate: false, validate: false });
    }, 600);

    // Cleanup
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [dirtyFields, save]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  return {
    saveStatus,
    error,
    markDirty,
    updateFormData,
    save,
    reset,
  };
}

// Export a helper to get form data from the hook
export function createFormDataGetter(dataRef: React.MutableRefObject<EventFormData>) {
  return () => dataRef.current;
}
