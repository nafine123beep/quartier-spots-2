"use client";

import { useState, useEffect } from "react";
import { useFlohmarkt } from "../../FlohmarktContext";
import { Spot } from "../../types";
import { geocodeAddress, GeocodeResult } from "../../lib/geocoding";
import { AddressPinSelector } from "../shared/AddressPinSelector";
import { BASE_HIGHLIGHT_TYPES, getAllHighlightTypes } from "../../lib/highlightConfig";
import { isWithinBoundary } from "../../lib/geoUtils";

interface HighlightFormModalProps {
  highlight: Spot | null;
  onClose: () => void;
}

export function HighlightFormModal({ highlight, onClose }: HighlightFormModalProps) {
  const { addHighlight, updateHighlight, currentTenantEvent, customHighlightTypes } = useFlohmarkt();
  const isEditing = !!highlight;

  // Form state
  const [highlightType, setHighlightType] = useState(highlight?.highlight_type || '');
  const [title, setTitle] = useState(highlight?.title || '');
  const [publicNote, setPublicNote] = useState(highlight?.public_note || '');
  const [street, setStreet] = useState(highlight?.street || '');
  const [houseNumber, setHouseNumber] = useState(highlight?.house_number || '');
  const [zip, setZip] = useState(highlight?.zip || '');
  const [city, setCity] = useState(highlight?.city || '');
  const [addressPublic, setAddressPublic] = useState(highlight?.address_public || false);

  // Geocoding state
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeResult, setGeocodeResult] = useState<GeocodeResult | null>(
    highlight?.lat && highlight?.lng
      ? { lat: highlight.lat, lng: highlight.lng }
      : null
  );
  const [finalLat, setFinalLat] = useState<number | null>(highlight?.lat || null);
  const [finalLng, setFinalLng] = useState<number | null>(highlight?.lng || null);
  const [geoPrecision, setGeoPrecision] = useState<'exact' | 'street' | 'city'>(highlight?.geo_precision || 'exact');
  const [showPinSelector, setShowPinSelector] = useState(false);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get all available types (base + custom)
  const allTypes = getAllHighlightTypes(customHighlightTypes);

  // Auto-select icon when type changes
  const selectedTypeIcon = allTypes.find(t => t.key === highlightType)?.icon || '';

  const handleGeocode = async () => {
    if (!street || !zip || !city) {
      setError('Bitte fülle mindestens Straße, PLZ und Stadt aus');
      return;
    }

    setGeocoding(true);
    setError(null);

    const fullAddress = `${street} ${houseNumber}, ${zip} ${city}`;
    const result = await geocodeAddress(fullAddress);

    setGeocoding(false);

    if (!result) {
      setError('Adresse konnte nicht gefunden werden. Bitte überprüfe die Eingabe.');
      return;
    }

    setGeocodeResult(result);
    setFinalLat(result.lat);
    setFinalLng(result.lng);
    setGeoPrecision('exact');

    // Check boundary
    if (currentTenantEvent?.boundary_radius_meters &&
        currentTenantEvent.map_center_lat &&
        currentTenantEvent.map_center_lng) {
      const withinBoundary = isWithinBoundary(
        result.lat,
        result.lng,
        currentTenantEvent.map_center_lat,
        currentTenantEvent.map_center_lng,
        currentTenantEvent.boundary_radius_meters
      );

      if (!withinBoundary) {
        setError('Warnung: Dieser Standort liegt außerhalb des Event-Bereichs');
      }
    }

    // Auto-open pin selector
    setShowPinSelector(true);
  };

  const handlePinConfirm = (lat: number, lng: number) => {
    setFinalLat(lat);
    setFinalLng(lng);
    setShowPinSelector(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!highlightType) {
      setError('Bitte wähle einen Highlight-Typ aus');
      return;
    }

    if (!title) {
      setError('Bitte gib einen Titel ein');
      return;
    }

    if (!finalLat || !finalLng) {
      setError('Bitte geocodiere die Adresse oder setze den Pin auf der Karte');
      return;
    }

    // Check boundary again before submission
    if (currentTenantEvent?.boundary_radius_meters &&
        currentTenantEvent.map_center_lat &&
        currentTenantEvent.map_center_lng) {
      const withinBoundary = isWithinBoundary(
        finalLat,
        finalLng,
        currentTenantEvent.map_center_lat,
        currentTenantEvent.map_center_lng,
        currentTenantEvent.boundary_radius_meters
      );

      if (!withinBoundary && !confirm('Dieser Standort liegt außerhalb des Event-Bereichs. Trotzdem fortfahren?')) {
        return;
      }
    }

    setSubmitting(true);
    setError(null);

    // Construct address_raw string from components
    const addressRaw = `${street}${houseNumber ? ' ' + houseNumber : ''}, ${zip} ${city}`.trim();

    const highlightData: Partial<Spot> = {
      is_highlight: true,
      highlight_type: highlightType,
      highlight_icon: selectedTypeIcon,
      title,
      public_note: publicNote || undefined,
      street: street || undefined,
      house_number: houseNumber || undefined,
      zip: zip || undefined,
      city: city || undefined,
      address_raw: addressRaw,
      address_public: addressPublic,
      lat: finalLat,
      lng: finalLng,
      geo_precision: geoPrecision,
    };

    let success = false;

    if (isEditing) {
      success = await updateHighlight(highlight!.id, highlightData);
    } else {
      const id = await addHighlight(highlightData as Omit<Spot, "id">);
      success = !!id;
    }

    setSubmitting(false);

    if (success) {
      onClose();
    } else {
      setError('Fehler beim Speichern des Highlights');
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Highlight bearbeiten' : 'Neues Highlight erstellen'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Highlight Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Highlight-Typ *
              </label>
              <select
                value={highlightType}
                onChange={(e) => setHighlightType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                required
              >
                <option value="">Typ auswählen...</option>
                <optgroup label="Standard-Typen">
                  {BASE_HIGHLIGHT_TYPES.map((type) => (
                    <option key={type.key} value={type.key}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </optgroup>
                {customHighlightTypes.length > 0 && (
                  <optgroup label="Benutzerdefinierte Typen">
                    {customHighlightTypes.map((type) => (
                      <option key={type.id} value={type.type_key}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titel *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                placeholder="z.B. Haupteingang Registrierung"
                required
                maxLength={100}
              />
            </div>

            {/* Public Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Beschreibung (öffentlich sichtbar)
              </label>
              <textarea
                value={publicNote}
                onChange={(e) => setPublicNote(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                rows={3}
                placeholder="z.B. Hier kannst du dich anmelden und dein Event-Badge abholen"
                maxLength={500}
              />
            </div>

            {/* Address Fields */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Standort</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Straße
                  </label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                    placeholder="z.B. Hauptstraße"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hausnummer
                  </label>
                  <input
                    type="text"
                    value={houseNumber}
                    onChange={(e) => setHouseNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                    placeholder="z.B. 15"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PLZ
                  </label>
                  <input
                    type="text"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                    placeholder="z.B. 90402"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stadt
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                    placeholder="z.B. Nürnberg"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleGeocode}
                disabled={geocoding || !street || !zip || !city}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {geocoding ? 'Wird gesucht...' : 'Adresse geocodieren und Pin setzen'}
              </button>

              {geocodeResult && (
                <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✓ Standort gefunden: {finalLat?.toFixed(6)}, {finalLng?.toFixed(6)}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowPinSelector(true)}
                    className="text-sm text-[#003366] hover:underline mt-1"
                  >
                    Pin auf Karte anpassen
                  </button>
                </div>
              )}

              {/* Address Public Checkbox */}
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={addressPublic}
                  onChange={(e) => setAddressPublic(e.target.checked)}
                  className="rounded border-gray-300 text-[#003366] focus:ring-[#003366]"
                />
                <span>Adresse öffentlich anzeigen</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="submit"
                disabled={submitting || !highlightType || !title || !finalLat || !finalLng}
                className="flex-1 px-4 py-3 bg-[#003366] text-white rounded-lg hover:bg-[#002244] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Wird gespeichert...' : (isEditing ? 'Änderungen speichern' : 'Highlight erstellen')}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Pin Selector Modal */}
      {showPinSelector && geocodeResult && currentTenantEvent && (
        <AddressPinSelector
          initialLat={finalLat || geocodeResult.lat}
          initialLng={finalLng || geocodeResult.lng}
          address={`${street}${houseNumber ? ' ' + houseNumber : ''}, ${zip} ${city}`.trim()}
          boundaryCenter={
            currentTenantEvent.map_center_lat && currentTenantEvent.map_center_lng
              ? { lat: currentTenantEvent.map_center_lat, lng: currentTenantEvent.map_center_lng }
              : undefined
          }
          boundaryRadiusMeters={currentTenantEvent.boundary_radius_meters || undefined}
          onConfirm={handlePinConfirm}
          onCancel={() => setShowPinSelector(false)}
        />
      )}
    </>
  );
}
