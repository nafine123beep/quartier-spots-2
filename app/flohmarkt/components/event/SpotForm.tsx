"use client";

import { useState, useEffect } from "react";
import { useFlohmarkt } from "../../FlohmarktContext";
import { geocodeAddress, GeocodeResult } from "../../lib/geocoding";
import { normalizeAddress } from "../../lib/addressNormalization";
import { validateHouseNumber, isPartialHouseNumber } from "../../lib/houseNumberValidation";
import { AddressPinSelector } from "../shared/AddressPinSelector";
import { getSpotTerms } from "../../lib/spotTerms";
import { UseCurrentLocationButton } from "../shared/UseCurrentLocationButton";
import {
  loadLocationCache,
  saveLocationToCache,
  isCompleteCache,
} from "../../lib/locationCache";
import { ChevronDown, ChevronRight } from "lucide-react";

const FORM_STORAGE_KEY = "spotFormData";

export function SpotForm() {
  const { addSpot, setCurrentTab, setHighlightedSpotId, currentTenantEvent, currentTenant } = useFlohmarkt();
  const terms = getSpotTerms(currentTenantEvent?.spot_term_singular, currentTenantEvent?.spot_term_plural);
  // Address fields
  const [street, setStreet] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [houseNumberError, setHouseNumberError] = useState<string | undefined>(undefined);
  const [zip, setZip] = useState("");
  const [city, setCity] = useState("");
  // Contact fields
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [publicNote, setPublicNote] = useState("");
  const [addressPublic, setAddressPublic] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showContactFields, setShowContactFields] = useState(false);
  // Pin selector state
  const [showPinSelector, setShowPinSelector] = useState(false);
  const [geocodeResult, setGeocodeResult] = useState<GeocodeResult | null>(null);
  const [finalLat, setFinalLat] = useState<number | null>(null);
  const [finalLng, setFinalLng] = useState<number | null>(null);
  // Location cache state
  const [cacheLoaded, setCacheLoaded] = useState(false);

  // Load saved form data on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem(FORM_STORAGE_KEY);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          if (parsed.eventId === currentTenantEvent?.id) {
            setStreet(parsed.street || "");
            setHouseNumber(parsed.houseNumber || "");
            setZip(parsed.zip || "");
            setCity(parsed.city || "");
            setContactName(parsed.contactName || "");
            setContactEmail(parsed.contactEmail || "");
            setContactPhone(parsed.contactPhone || "");
            setPublicNote(parsed.publicNote || "");
            setAddressPublic(parsed.addressPublic || false);
          }
        } catch (error) {
          console.error("Error loading saved form data:", error);
        }
      }
    }
  }, [currentTenantEvent?.id]);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && currentTenantEvent) {
      const formData = {
        eventId: currentTenantEvent.id,
        street,
        houseNumber,
        zip,
        city,
        contactName,
        contactEmail,
        contactPhone,
        publicNote,
        addressPublic,
      };
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
    }
  }, [street, houseNumber, zip, city, contactName, contactEmail, contactPhone, publicNote, addressPublic, currentTenantEvent]);

  // Load location cache and pre-populate if available
  useEffect(() => {
    if (typeof window === 'undefined' || cacheLoaded) return;

    // Priority: Form persistence > Location cache
    const hasExistingData = street || houseNumber || zip || city;
    if (hasExistingData) {
      setCacheLoaded(true);
      return;
    }

    const cache = loadLocationCache();

    // Only pre-populate if we have a complete cached address with consent
    if (isCompleteCache(cache) && cache.consentGiven) {
      // Pre-populate from cache
      setStreet(cache.address.street);
      setHouseNumber(cache.address.houseNumber);
      setZip(cache.address.zip);
      setCity(cache.address.city);
      setFinalLat(cache.coordinates.lat);
      setFinalLng(cache.coordinates.lng);
      setShowCacheIndicator(true);

      // Update lastUsed timestamp
      saveLocationToCache(cache.address, cache.coordinates, true);
    }

    setCacheLoaded(true);
  }, [street, houseNumber, zip, city, cacheLoaded]);

  // Handle house number change with validation
  const handleHouseNumberChange = (value: string) => {
    setHouseNumber(value);

    // Don't show errors for partial input states (e.g., typing "42-" for range)
    if (isPartialHouseNumber(value)) {
      setHouseNumberError(undefined);
      return;
    }

    // Validate the house number
    const validation = validateHouseNumber(value);
    if (!validation.isValid) {
      setHouseNumberError(validation.errorMessage);
    } else {
      setHouseNumberError(undefined);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenantEvent || !currentTenant) {
      alert("Kein Event ausgewählt.");
      return;
    }

    // Validate house number before submission
    const houseNumberValidation = validateHouseNumber(houseNumber);
    if (!houseNumberValidation.isValid) {
      alert(`Bitte korrigiere die Hausnummer:\n${houseNumberValidation.errorMessage}`);
      setHouseNumberError(houseNumberValidation.errorMessage);
      return;
    }

    setSubmitting(true);

    // Normalize address fields before processing
    const normalized = normalizeAddress(street, houseNumber, zip, city);
    console.log("Normalized address:", normalized);

    // Build address query from normalized fields
    const addressParts = [
      normalized.street,
      normalized.houseNumber,
      normalized.zip,
      normalized.city
    ].filter(Boolean);
    const addressQuery = addressParts.join(" ");

    if (!addressQuery.trim()) {
      alert("Bitte gib mindestens Straße und Stadt ein.");
      setSubmitting(false);
      return;
    }

    console.log("Submitting spot with address:", addressQuery);

    // Skip geocoding if coordinates are already cached
    if (finalLat !== null && finalLng !== null) {
      console.log("Using cached coordinates:", finalLat, finalLng);
      setSubmitting(false);
      setShowPinSelector(true);
    } else {
      // Geocode the address
      const result = await geocodeAddress(addressQuery);

      if (!result) {
        alert(
          `Adresse konnte nicht gefunden werden.\n\n` +
          `Eingegebene Adresse: ${addressQuery}\n\n` +
          `Bitte überprüfe:\n` +
          `- Ist die Straße korrekt geschrieben?\n` +
          `- Ist die Stadt korrekt?\n` +
          `- Liegt die Adresse in Deutschland?\n\n` +
          `Tipp: Versuche es ohne Hausnummer oder PLZ, nur mit Straße und Stadt.`
        );
        setSubmitting(false);
        return;
      }

      console.log("Geocoding successful:", result);

      // Store geocode result and show pin selector
      setGeocodeResult(result);
      setFinalLat(result.lat);
      setFinalLng(result.lng);
      setSubmitting(false);
      setShowPinSelector(true);
    }
  };

  const handlePinConfirm = async (lat: number, lng: number) => {
    if (!currentTenantEvent || !currentTenant) {
      return;
    }

    setShowPinSelector(false);
    setSubmitting(true);

    // Normalize address fields
    const normalized = normalizeAddress(street, houseNumber, zip, city);

    // Build address query
    const addressParts = [
      normalized.street,
      normalized.houseNumber,
      normalized.zip,
      normalized.city
    ].filter(Boolean);
    const addressQuery = addressParts.join(" ");

    const newSpotId = await addSpot({
      tenant_id: currentTenant.id,
      event_id: currentTenantEvent.id,
      address_raw: addressQuery,
      address_public: addressPublic,
      public_note: publicNote,
      // Use normalized user input first, fallback to geocoded values if available
      street: normalized.street || geocodeResult?.street,
      house_number: normalized.houseNumber || geocodeResult?.houseNumber,
      zip: normalized.zip || geocodeResult?.zip,
      city: normalized.city || geocodeResult?.city,
      lat: lat, // Use confirmed coordinates
      lng: lng, // Use confirmed coordinates
      geo_precision: 'exact',
      contact_name: contactName,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      is_highlight: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    setSubmitting(false);

    if (newSpotId) {
      setHighlightedSpotId(newSpotId);

      // Clear saved form data from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem(FORM_STORAGE_KEY);
      }

      // Reset form
      setStreet("");
      setHouseNumber("");
      setHouseNumberError(undefined);
      setZip("");
      setCity("");
      setContactName("");
      setContactEmail("");
      setContactPhone("");
      setPublicNote("");
      setAddressPublic(false);
      setGeocodeResult(null);
      setFinalLat(null);
      setFinalLng(null);

      // Show success modal and redirect to list
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        setCurrentTab("list");
      }, 3000);
    } else {
      alert(terms.errorCreatingSpot);
    }
  };

  const handlePinCancel = () => {
    setShowPinSelector(false);
    setGeocodeResult(null);
    setFinalLat(null);
    setFinalLng(null);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setCurrentTab("list");
  };

  return (
    <div className="h-full overflow-y-auto p-5">
      <div className="max-w-[600px] mx-auto bg-white p-5 rounded-lg">
        <h3 className="mt-0 text-[#003366]">{terms.yourSpot}</h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="street" className="block mb-1 font-bold text-gray-700 text-sm">
              Straße *
            </label>
            <input
              id="street"
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="z.B. Hauptstraße"
              required
              className="w-full p-3 border border-gray-300 rounded-md text-base text-gray-900 placeholder:text-gray-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="houseNumber" className="block mb-1 font-bold text-gray-700 text-sm">
                Hausnummer
              </label>
              <input
                id="houseNumber"
                type="text"
                value={houseNumber}
                onChange={(e) => handleHouseNumberChange(e.target.value)}
                placeholder="z.B. 42"
                className={`w-full p-3 border rounded-md text-base text-gray-900 placeholder:text-gray-400 ${
                  houseNumberError ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {houseNumberError && (
                <p className="mt-1 text-xs text-red-600">{houseNumberError}</p>
              )}
            </div>
            <div>
              <label htmlFor="zip" className="block mb-1 font-bold text-gray-700 text-sm">
                PLZ
              </label>
              <input
                id="zip"
                type="text"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                placeholder="z.B. 93051"
                className="w-full p-3 border border-gray-300 rounded-md text-base text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="city" className="block mb-1 font-bold text-gray-700 text-sm">
              Ort *
            </label>
            <input
              id="city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="z.B. Regensburg"
              required
              className="w-full p-3 border border-gray-300 rounded-md text-base text-gray-900 placeholder:text-gray-400"
            />
          </div>

          {/* GPS Location Button */}
          <div className="mb-5">
            <UseCurrentLocationButton
              onLocationDetected={(location) => {
                setStreet(location.street);
                setHouseNumber(location.houseNumber);
                setZip(location.zip);
                setCity(location.city);
                setFinalLat(location.lat);
                setFinalLng(location.lng);
              }}
              disabled={submitting}
            />
          </div>

          <div className="flex items-start gap-2.5 mb-5">
            <input
              type="checkbox"
              id="addressPublic"
              checked={addressPublic}
              onChange={(e) => setAddressPublic(e.target.checked)}
              required
              className="w-5 h-5 mt-0.5 shrink-0"
            />
            <label htmlFor="addressPublic" className="text-sm text-gray-700 leading-snug">
              Ich bin damit einverstanden, dass meine Adresse öffentlich auf der
              Karte angezeigt wird. *
            </label>
          </div>

          <div className="mb-4">
            <label htmlFor="publicNote" className="block mb-1 font-bold text-gray-700 text-sm">
              Was bietest du an? *
            </label>
            <textarea
              id="publicNote"
              value={publicNote}
              onChange={(e) => setPublicNote(e.target.value)}
              rows={3}
              placeholder="z.B. Kindersachen, Bücher..."
              required
              className="w-full p-3 border border-gray-300 rounded-md text-base text-gray-900 placeholder:text-gray-400 resize-y"
            />
          </div>

          {/* Collapsible Contact Section */}
          <div className="mb-5 border border-gray-300 rounded-lg overflow-hidden">
            {/* Clickable Header */}
            <button
              type="button"
              onClick={() => setShowContactFields(!showContactFields)}
              className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <span className="text-sm font-medium text-gray-700">
                Name, E-Mail oder Telefon angeben (optional)
              </span>
              {showContactFields ? (
                <ChevronDown className="h-5 w-5 text-gray-500" aria-hidden="true" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-500" aria-hidden="true" />
              )}
            </button>

            {/* Data Security Notice - Always visible */}
            <div className="flex items-start gap-2 px-3 py-2 bg-blue-50 border-t border-blue-200">
              <span className="text-lg flex-shrink-0">🔒</span>
              <p className="text-xs text-gray-600 m-0">
                Name, E-Mail und Telefon werden nicht öffentlich angezeigt und dienen nur der Kontaktaufnahme durch Veranstalter:innen.
              </p>
            </div>

            {/* Contact Fields */}
            {showContactFields && (
              <div className="space-y-3 p-3 border-t border-gray-200">
                <div>
                  <label htmlFor="contactName" className="block mb-1 text-gray-600 text-sm">
                    Dein Name
                  </label>
                  <input
                    id="contactName"
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Name"
                    className="w-full p-2.5 border border-gray-300 rounded-md text-sm text-gray-900 placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label htmlFor="contactEmail" className="block mb-1 text-gray-600 text-sm">
                    E-Mail
                  </label>
                  <input
                    id="contactEmail"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="E-Mail-Adresse"
                    className="w-full p-2.5 border border-gray-300 rounded-md text-sm text-gray-900 placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label htmlFor="contactPhone" className="block mb-1 text-gray-600 text-sm">
                    Telefon
                  </label>
                  <input
                    id="contactPhone"
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="Telefonnummer"
                    className="w-full p-2.5 border border-gray-300 rounded-md text-sm text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#003366] text-white p-3.5 border-none rounded-md text-lg font-bold cursor-pointer hover:bg-[#002244] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Wird gespeichert..." : "Absenden"}
          </button>
        </form>
      </div>

      {/* Pin Selector Modal */}
      {showPinSelector && finalLat !== null && finalLng !== null && (
        <AddressPinSelector
          initialLat={finalLat}
          initialLng={finalLng}
          address={`${street} ${houseNumber}, ${zip} ${city}`.trim()}
          onConfirm={handlePinConfirm}
          onCancel={handlePinCancel}
          boundaryCenter={
            currentTenantEvent?.map_center_lat && currentTenantEvent?.map_center_lng
              ? { lat: currentTenantEvent.map_center_lat, lng: currentTenantEvent.map_center_lng }
              : undefined
          }
          boundaryRadiusMeters={currentTenantEvent?.boundary_radius_meters ?? undefined}
        />
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              {/* Success Icon */}
              <div className="mb-6">
                <div className="w-24 h-24 bg-[#003366] rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>

              {/* Success Message */}
              <h2 className="text-3xl font-bold text-[#003366] mb-3">
                {terms.spotCreated}
              </h2>
              <p className="text-gray-600 mb-8 text-lg">
                Dein {terms.singular} wurde erfolgreich gespeichert und ist jetzt auf der Karte sichtbar.
              </p>

              {/* Action Button */}
              <button
                onClick={handleCloseSuccessModal}
                className="w-full bg-[#003366] text-white px-6 py-4 rounded-lg text-lg font-bold hover:bg-[#002244] transition-colors shadow-md"
              >
                {terms.toSpotList}
              </button>

              {/* Auto-close info */}
              <p className="text-sm text-gray-400 mt-4">
                Wird automatisch weitergeleitet...
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
