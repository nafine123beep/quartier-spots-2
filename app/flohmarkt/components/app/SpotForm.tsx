"use client";

import { useState, useEffect } from "react";
import { useFlohmarkt } from "../../FlohmarktContext";
import { geocodeAddress, GeocodeResult } from "../../lib/geocoding";
import { AddressPinSelector } from "../shared/AddressPinSelector";
import { getSpotTerms } from "../../lib/spotTerms";
import { LocationCacheConsentModal } from "../shared/LocationCacheConsentModal";
import { AddressCacheIndicator } from "../shared/AddressCacheIndicator";
import { UseCurrentLocationButton } from "../shared/UseCurrentLocationButton";
import {
  loadLocationCache,
  saveLocationToCache,
  updateCacheConsent,
  isCompleteCache,
} from "../../lib/locationCache";

export function SpotForm() {
  const { addSpot, setCurrentTab, currentTenantEvent, currentTenant } = useFlohmarkt();
  const terms = getSpotTerms(currentTenantEvent?.spot_term_singular, currentTenantEvent?.spot_term_plural);
  const [addressRaw, setAddressRaw] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [publicNote, setPublicNote] = useState("");
  const [addressPublic, setAddressPublic] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // Pin selector state
  const [showPinSelector, setShowPinSelector] = useState(false);
  const [geocodeResult, setGeocodeResult] = useState<GeocodeResult | null>(null);
  const [finalLat, setFinalLat] = useState<number | null>(null);
  const [finalLng, setFinalLng] = useState<number | null>(null);
  // Location cache state
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showCacheIndicator, setShowCacheIndicator] = useState(false);
  const [cacheLoaded, setCacheLoaded] = useState(false);

  // Load location cache on mount
  useEffect(() => {
    if (typeof window === 'undefined' || cacheLoaded) return;

    // Don't override if form already has data
    if (addressRaw) {
      setCacheLoaded(true);
      return;
    }

    const cache = loadLocationCache();

    // Only pre-populate if we have a complete cached address with consent
    if (isCompleteCache(cache) && cache.consentGiven) {
      // Pre-populate from cache
      setAddressRaw(cache.address.addressRaw);
      setFinalLat(cache.coordinates.lat);
      setFinalLng(cache.coordinates.lng);
      setShowCacheIndicator(true);

      // Update lastUsed timestamp
      saveLocationToCache(cache.address, cache.coordinates, true);
    }

    setCacheLoaded(true);
  }, [addressRaw, cacheLoaded]);

  // Handle consent acceptance
  const handleConsentAccept = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('locationCacheAsked', 'true');

      // Save the pending address that was just created
      const pendingStr = localStorage.getItem('pendingAddressCache');
      if (pendingStr) {
        try {
          const pending = JSON.parse(pendingStr);
          saveLocationToCache(
            {
              street: '',
              houseNumber: '',
              zip: '',
              city: '',
              addressRaw: pending.addressRaw,
            },
            {
              lat: pending.lat,
              lng: pending.lng,
              geoPrecision: 'exact',
            },
            true
          );
          localStorage.removeItem('pendingAddressCache');

          // Immediately pre-fill the form with the saved address
          setAddressRaw(pending.addressRaw);
          setFinalLat(pending.lat);
          setFinalLng(pending.lng);
          setShowCacheIndicator(true);
        } catch (error) {
          console.error('Error saving pending address:', error);
        }
      } else {
        // No pending address, just update consent
        updateCacheConsent(true, '1.0');
      }
    }
    setShowConsentModal(false);
    // Stay on form tab with pre-filled address (don't redirect to list)
  };

  // Handle consent decline
  const handleConsentDecline = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('locationCacheAsked', 'true');
      updateCacheConsent(false, '1.0');
      localStorage.removeItem('pendingAddressCache');
    }
    setShowConsentModal(false);
    // Stay on form tab (don't redirect)
  };

  // Handle clearing cached address
  const handleClearCache = () => {
    setAddressRaw('');
    setFinalLat(null);
    setFinalLng(null);
    setShowCacheIndicator(false);
  };

  // Handle dismissing cache indicator
  const handleDismissIndicator = () => {
    setShowCacheIndicator(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenantEvent || !currentTenant) {
      alert("Kein Event ausgewählt.");
      return;
    }

    setSubmitting(true);

    // Skip geocoding if coordinates are already cached
    if (finalLat !== null && finalLng !== null) {
      setSubmitting(false);
      setShowPinSelector(true);
    } else {
      // Geocode the address
      const result = await geocodeAddress(addressRaw);

      if (!result) {
        alert("Adresse konnte nicht gefunden werden. Bitte überprüfe die Eingabe und versuche es erneut.");
        setSubmitting(false);
        return;
      }

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

    await addSpot({
      tenant_id: currentTenant.id,
      event_id: currentTenantEvent.id,
      address_raw: addressRaw,
      address_public: addressPublic,
      public_note: publicNote,
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

    // Check if we should ask for consent to cache location
    const cache = loadLocationCache();
    const askedBefore = typeof window !== 'undefined' ? localStorage.getItem('locationCacheAsked') : null;

    if (cache?.consentGiven) {
      // Already have consent, just save the address
      saveLocationToCache(
        {
          street: '',
          houseNumber: '',
          zip: '',
          city: '',
          addressRaw: addressRaw,
        },
        {
          lat,
          lng,
          geoPrecision: 'exact',
        },
        true
      );
      alert(terms.spotCreated);
      setCurrentTab("list");
    } else if (!askedBefore) {
      // First time - ask for consent to save this address
      alert(terms.spotCreated);
      setShowConsentModal(true);

      // Store the address temporarily so we can save it after consent
      if (typeof window !== 'undefined') {
        localStorage.setItem('pendingAddressCache', JSON.stringify({
          addressRaw,
          lat,
          lng,
        }));
      }
    } else {
      // User previously declined, don't ask again
      alert(terms.spotCreated);
      setCurrentTab("list");
    }

    // Reset form
    setAddressRaw("");
    setContactName("");
    setContactEmail("");
    setContactPhone("");
    setPublicNote("");
    setAddressPublic(false);
    setFinalLat(null);
    setFinalLng(null);
    setShowCacheIndicator(false);
  };

  const handlePinCancel = () => {
    setShowPinSelector(false);
    setGeocodeResult(null);
    setFinalLat(null);
    setFinalLng(null);
  };

  return (
    <div className="h-full overflow-y-auto p-5">
      <div className="max-w-[600px] mx-auto bg-white p-5 rounded-lg">
        <h3 className="mt-0 text-[#003366]">{terms.yourSpot}</h3>

        <form onSubmit={handleSubmit}>
          {/* Cache Indicator */}
          {showCacheIndicator && (
            <AddressCacheIndicator
              onClear={handleClearCache}
              onDismiss={handleDismissIndicator}
            />
          )}

          <div className="mb-4">
            <label className="block mb-1 font-bold text-gray-700 text-sm">
              Adresse
            </label>
            <input
              type="text"
              value={addressRaw}
              onChange={(e) => setAddressRaw(e.target.value)}
              placeholder="Straße, Hausnummer, Stadt"
              required
              className="w-full p-3 border border-gray-300 rounded-md text-base text-gray-900 placeholder:text-gray-400"
            />
          </div>

          {/* GPS Location Button */}
          <div className="mb-5">
            <UseCurrentLocationButton
              onLocationDetected={(location) => {
                const addressRaw = `${location.street}${location.houseNumber ? ' ' + location.houseNumber : ''}, ${location.zip} ${location.city}`.trim();
                setAddressRaw(addressRaw);
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
              Karte angezeigt wird.
            </label>
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-bold text-gray-700 text-sm">
              Dein Name (Optional)
            </label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Name"
              className="w-full p-3 border border-gray-300 rounded-md text-base text-gray-900 placeholder:text-gray-400"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-bold text-gray-700 text-sm">
              E-Mail (Optional)
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="E-Mail-Adresse"
              className="w-full p-3 border border-gray-300 rounded-md text-base text-gray-900 placeholder:text-gray-400"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-bold text-gray-700 text-sm">
              Telefon (Optional)
            </label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="Telefonnummer"
              className="w-full p-3 border border-gray-300 rounded-md text-base text-gray-900 placeholder:text-gray-400"
            />
          </div>

          <div className="text-xs text-gray-600 -mt-2.5 mb-5 bg-gray-50 p-2.5 rounded leading-snug">
            Hinweis: Name, E-Mail und Telefon werden nicht öffentlich angezeigt.
            Daten dienen lediglich der Kontaktaufnahme seitens der
            Veranstalter:innen.
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-bold text-gray-700 text-sm">
              Was bietest du an?
            </label>
            <textarea
              value={publicNote}
              onChange={(e) => setPublicNote(e.target.value)}
              rows={3}
              placeholder="z.B. Kindersachen, Bücher..."
              required
              className="w-full p-3 border border-gray-300 rounded-md text-base text-gray-900 placeholder:text-gray-400 resize-y"
            />
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
          address={addressRaw}
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

      {/* Consent Modal */}
      <LocationCacheConsentModal
        isOpen={showConsentModal}
        onAccept={handleConsentAccept}
        onDecline={handleConsentDecline}
        onClose={() => setShowConsentModal(false)}
      />
    </div>
  );
}
