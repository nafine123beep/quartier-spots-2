"use client";

import { useState, useEffect, useCallback } from "react";
import { useFlohmarkt } from "../../../../FlohmarktContext";
import { geocodeAddress, GeocodeResult } from "../../../../lib/geocoding";
import { uploadEventImage, deleteEventImage, getPublicImageUrl } from "../../../../lib/imageUpload";
import { getSpotTerms, SPOT_TERM_PRESETS } from "../../../../lib/spotTerms";
import { BOUNDARY_RADIUS_PRESETS } from "../../../../lib/geoUtils";
import { ImageCropModal } from "../../../shared/ImageCropModal";
import { MapPin, Calendar, Image as ImageIcon, Settings, ChevronDown, ChevronRight, X, Crop, Star, Loader2 } from "lucide-react";

interface CreateStepProps {
  onNext: () => void;
  onUnsavedChanges: (hasChanges: boolean) => void;
}

interface StagedImage {
  id: string;
  file: File;
  previewUrl: string;
  isCover: boolean;
}

export function CreateStep({ onNext, onUnsavedChanges }: CreateStepProps) {
  const { currentTenantEvent, currentTenant, updateEvent } = useFlohmarkt();

  // Form state
  const [title, setTitle] = useState(currentTenantEvent?.title || "");
  const [description, setDescription] = useState(currentTenantEvent?.description || "");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [mapCenterAddress, setMapCenterAddress] = useState(currentTenantEvent?.map_center_address || "");

  // Optional sections
  const [enableBoundary, setEnableBoundary] = useState(!!currentTenantEvent?.boundary_radius_meters);
  const [boundaryRadius, setBoundaryRadius] = useState<number | null>(currentTenantEvent?.boundary_radius_meters || null);
  const [enableCustomTerms, setEnableCustomTerms] = useState(false);
  const [selectedTermPreset, setSelectedTermPreset] = useState("Stand");
  const [customTermSingular, setCustomTermSingular] = useState("");
  const [customTermPlural, setCustomTermPlural] = useState("");

  // Image state
  const [stagedImages, setStagedImages] = useState<StagedImage[]>([]);
  const [existingImages, setExistingImages] = useState(currentTenantEvent?.images || []);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [cropImage, setCropImage] = useState<{ id: string; url: string; isExisting: boolean } | null>(null);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);

  const isNewEvent = !currentTenantEvent?.id;

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
      description !== (currentTenantEvent?.description || "") ||
      stagedImages.length > 0;
    onUnsavedChanges(hasChanges);
  }, [title, description, stagedImages, currentTenantEvent, onUnsavedChanges]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      stagedImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
  }, [stagedImages]);

  const formatDateTimeLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = existingImages.length + stagedImages.length + files.length;

    if (totalImages > 5) {
      setError("Maximal 5 Fotos erlaubt");
      return;
    }

    const newStagedImages: StagedImage[] = files.map((file, index) => ({
      id: `staged-${Date.now()}-${index}`,
      file,
      previewUrl: URL.createObjectURL(file),
      isCover: existingImages.length === 0 && stagedImages.length === 0 && index === 0,
    }));

    setStagedImages((prev) => [...prev, ...newStagedImages]);
    e.target.value = ""; // Reset input
  };

  const removeStagedImage = (id: string) => {
    setStagedImages((prev) => {
      const updated = prev.filter((img) => img.id !== id);
      // Reassign cover if needed
      if (updated.length > 0 && !updated.some((img) => img.isCover)) {
        updated[0].isCover = true;
      }
      return updated;
    });
  };

  const setStagedCover = (id: string) => {
    setStagedImages((prev) =>
      prev.map((img) => ({
        ...img,
        isCover: img.id === id,
      }))
    );
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Bitte gib einen Titel ein");
      return;
    }

    if (!startsAt || !endsAt) {
      setError("Bitte gib Start- und Enddatum ein");
      return;
    }

    if (!mapCenterAddress.trim()) {
      setError("Bitte gib eine Adresse für das Kartenzentrum ein");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Geocode address
      const geocodeResult: GeocodeResult | null = await geocodeAddress(mapCenterAddress);

      if (!geocodeResult) {
        setError("Adresse konnte nicht gefunden werden. Bitte überprüfe die Eingabe.");
        setIsLoading(false);
        return;
      }

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

      // Update event
      const result = await updateEvent(currentTenantEvent!.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        starts_at: new Date(startsAt).toISOString(),
        ends_at: new Date(endsAt).toISOString(),
        map_center_address: mapCenterAddress.trim(),
        map_center_lat: geocodeResult.lat,
        map_center_lng: geocodeResult.lng,
        boundary_radius_meters: enableBoundary ? boundaryRadius : null,
        spot_term_singular: spotTermSingular,
        spot_term_plural: spotTermPlural,
      });

      if (!result.success) {
        setError(result.error || "Fehler beim Speichern");
        setIsLoading(false);
        return;
      }

      // Upload staged images
      if (stagedImages.length > 0) {
        setUploadingImages(true);
        for (let i = 0; i < stagedImages.length; i++) {
          const staged = stagedImages[i];
          await uploadEventImage(
            currentTenantEvent!.id,
            staged.file,
            existingImages.length + i,
            staged.isCover && existingImages.length === 0
          );
        }
        setUploadingImages(false);
        setStagedImages([]);
      }

      onUnsavedChanges(false);
      onNext();
    } catch (err) {
      setError("Ein Fehler ist aufgetreten. Bitte versuche es erneut.");
    } finally {
      setIsLoading(false);
    }
  };

  const totalImages = existingImages.length + stagedImages.length;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white rounded-lg shadow-sm p-5">
        <h2 className="text-lg font-bold text-[#003366] mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Grunddaten
        </h2>

        <div className="space-y-4">
          {/* Title input */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Titel der Veranstaltung <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. Hinterhof-Flohmarkt Kreuzberg"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Beschreibung
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Beschreibe dein Event kurz..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent resize-none"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Photos */}
      <div className="bg-white rounded-lg shadow-sm p-5">
        <h2 className="text-lg font-bold text-[#003366] mb-4 flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Fotos
        </h2>

        <p className="text-sm text-gray-600 mb-4">
          Füge bis zu 5 Fotos hinzu. Das erste Foto wird als Titelbild verwendet.
        </p>

        {/* Image grid */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-4">
          {/* Existing images */}
          {existingImages.map((img) => (
            <div
              key={img.id}
              className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group"
            >
              <img
                src={getPublicImageUrl(img.storage_path)}
                alt="Event Foto"
                className="w-full h-full object-cover"
              />
              {img.is_cover && (
                <span className="absolute top-1 left-1 bg-yellow-400 text-yellow-900 text-[10px] px-1.5 py-0.5 rounded font-medium">
                  Titelbild
                </span>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => setCropImage({ id: img.id, url: getPublicImageUrl(img.storage_path), isExisting: true })}
                  className="p-2 bg-white rounded-full hover:bg-gray-100"
                  title="Zuschneiden"
                >
                  <Crop className="h-4 w-4 text-gray-700" />
                </button>
                {!img.is_cover && (
                  <button
                    onClick={async () => {
                      // Set as cover logic would go here
                    }}
                    className="p-2 bg-white rounded-full hover:bg-gray-100"
                    title="Als Titelbild"
                  >
                    <Star className="h-4 w-4 text-gray-700" />
                  </button>
                )}
                <button
                  onClick={() => setImageToDelete(img.id)}
                  className="p-2 bg-white rounded-full hover:bg-gray-100"
                  title="Löschen"
                >
                  <X className="h-4 w-4 text-red-600" />
                </button>
              </div>
            </div>
          ))}

          {/* Staged images */}
          {stagedImages.map((img) => (
            <div
              key={img.id}
              className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group"
            >
              <img
                src={img.previewUrl}
                alt="Neues Foto"
                className="w-full h-full object-cover"
              />
              {img.isCover && existingImages.length === 0 && (
                <span className="absolute top-1 left-1 bg-yellow-400 text-yellow-900 text-[10px] px-1.5 py-0.5 rounded font-medium">
                  Titelbild
                </span>
              )}
              <div className="absolute top-1 right-1 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                Neu
              </div>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!img.isCover && existingImages.length === 0 && (
                  <button
                    onClick={() => setStagedCover(img.id)}
                    className="p-2 bg-white rounded-full hover:bg-gray-100"
                    title="Als Titelbild"
                  >
                    <Star className="h-4 w-4 text-gray-700" />
                  </button>
                )}
                <button
                  onClick={() => removeStagedImage(img.id)}
                  className="p-2 bg-white rounded-full hover:bg-gray-100"
                  title="Entfernen"
                >
                  <X className="h-4 w-4 text-red-600" />
                </button>
              </div>
            </div>
          ))}

          {/* Add image button */}
          {totalImages < 5 && (
            <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#003366] hover:bg-gray-50 transition-colors">
              <ImageIcon className="h-6 w-6 text-gray-400 mb-1" />
              <span className="text-xs text-gray-500">Hinzufügen</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleImageSelect}
                className="hidden"
                disabled={isLoading}
              />
            </label>
          )}
        </div>

        <p className="text-xs text-gray-500">
          {totalImages}/5 Fotos • JPEG, PNG oder WebP • max. 5 MB pro Foto
        </p>
      </div>

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
              onChange={(e) => setStartsAt(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent"
              disabled={isLoading}
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
              onChange={(e) => setEndsAt(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent"
              disabled={isLoading}
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
            onChange={(e) => setMapCenterAddress(e.target.value)}
            placeholder="z.B. Oranienstraße 25, Berlin"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent"
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Diese Adresse bestimmt den Mittelpunkt der Karte für Teilnehmer.
          </p>
        </div>

        {/* Boundary radius toggle */}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setEnableBoundary(!enableBoundary)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-[#003366]"
          >
            {enableBoundary ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            Geografisches Gebiet einschränken
          </button>

          {enableBoundary && (
            <div className="mt-3 pl-6">
              <div className="flex flex-wrap gap-2 mb-3">
                {BOUNDARY_RADIUS_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setBoundaryRadius(preset.value)}
                    className={`px-3 py-1.5 rounded-full text-sm ${
                      boundaryRadius === preset.value
                        ? "bg-[#003366] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                Teilnehmer können sich nur innerhalb dieses Radius anmelden.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Custom terminology */}
      <div className="bg-white rounded-lg shadow-sm p-5">
        <button
          type="button"
          onClick={() => setEnableCustomTerms(!enableCustomTerms)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-[#003366] w-full text-left"
        >
          {enableCustomTerms ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          <span>Bezeichnung für &quot;Spots&quot; anpassen</span>
        </button>

        {/* Always-visible description */}
        <p className="text-xs text-gray-600 mt-2 ml-6">
          Dein Event wird aus mehreren &quot;Spots&quot; bestehen – das sind die Orte, an denen Teilnehmende aktiv sind. Wähle hier die Bezeichnung, die zu deinem Event passt.
        </p>

        {enableCustomTerms && (
          <div className="mt-3 pl-6">
            {/* Expanded help text */}
            <p className="text-xs text-gray-600 mb-3">
              Wähle z.B. &quot;Stand&quot; für Flohmärkte, &quot;Spielort&quot; oder &quot;Bühne&quot; für Musik-/Kulturveranstaltungen, &quot;Checkpoint&quot; für Rallyes oder eine eigene Bezeichnung.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
              {SPOT_TERM_PRESETS.map((preset) => (
                <button
                  key={preset.singular}
                  type="button"
                  onClick={() => setSelectedTermPreset(preset.singular)}
                  className={`px-3 py-2 rounded-lg text-sm ${
                    selectedTermPreset === preset.singular
                      ? "bg-[#003366] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {preset.singular}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setSelectedTermPreset("custom")}
                className={`px-3 py-2 rounded-lg text-sm ${
                  selectedTermPreset === "custom"
                    ? "bg-[#003366] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Eigene...
              </button>
            </div>

            {selectedTermPreset === "custom" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Singular</label>
                  <input
                    type="text"
                    value={customTermSingular}
                    onChange={(e) => setCustomTermSingular(e.target.value)}
                    placeholder="z.B. Platz"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Plural</label>
                  <input
                    type="text"
                    value={customTermPlural}
                    onChange={(e) => setCustomTermPlural(e.target.value)}
                    placeholder="z.B. Plätze"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Save button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-3 bg-[#003366] text-white rounded-lg font-bold hover:bg-[#002244] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>{uploadingImages ? "Fotos werden hochgeladen..." : "Wird gespeichert..."}</span>
            </>
          ) : (
            <span>Speichern und weiter</span>
          )}
        </button>
      </div>

      {/* Crop modal */}
      {cropImage && (
        <ImageCropModal
          imageUrl={cropImage.url}
          onComplete={async () => {
            // Handle crop complete
            setCropImage(null);
          }}
          onCancel={() => setCropImage(null)}
        />
      )}
    </div>
  );
}
