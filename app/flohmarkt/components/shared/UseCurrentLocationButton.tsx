"use client";

import { useState } from "react";
import { getCurrentPosition } from "../../lib/geolocation";
import { reverseGeocodeCoordinates } from "../../lib/geocoding";
import { MapPin, Loader2 } from '@/app/flohmarkt/components/icons';

interface UseCurrentLocationButtonProps {
  onLocationDetected: (address: {
    street: string;
    houseNumber: string;
    zip: string;
    city: string;
    lat: number;
    lng: number;
  }) => void;
  disabled?: boolean;
}

export function UseCurrentLocationButton({
  onLocationDetected,
  disabled = false,
}: UseCurrentLocationButtonProps) {
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setDetecting(true);
    setError(null);

    // Step 1: Get GPS position from browser
    const position = await getCurrentPosition();
    if (!position) {
      setError('Standort konnte nicht ermittelt werden');
      setDetecting(false);
      return;
    }

    console.log('GPS position detected:', position);

    // Step 2: Convert GPS coordinates to readable address
    const result = await reverseGeocodeCoordinates(position.lat, position.lng);
    if (!result) {
      setError('Adresse konnte nicht gefunden werden');
      setDetecting(false);
      return;
    }

    console.log('Address detected:', result);

    // Step 3: Pass the readable address to parent component
    onLocationDetected({
      street: result.street || '',
      houseNumber: result.houseNumber || '',
      zip: result.zip || '',
      city: result.city || '',
      lat: result.lat,
      lng: result.lng,
    });

    setDetecting(false);
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || detecting}
        className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-300 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {detecting ? (
          <>
            <Loader2 size={16} className="animate-spin" aria-label="Lädt" />
            Standort wird ermittelt...
          </>
        ) : (
          <>
            <MapPin size={16} aria-label="Standort" />
            Meinen Standort verwenden
          </>
        )}
      </button>
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}
