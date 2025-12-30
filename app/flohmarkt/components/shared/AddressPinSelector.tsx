"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker as LeafletMarker, DragEndEvent } from "leaflet";

interface AddressPinSelectorProps {
  initialLat: number;
  initialLng: number;
  address: string;
  onConfirm: (lat: number, lng: number) => void;
  onCancel: () => void;
}

export function AddressPinSelector({
  initialLat,
  initialLng,
  address,
  onConfirm,
  onCancel,
}: AddressPinSelectorProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const [currentLat, setCurrentLat] = useState(initialLat);
  const [currentLng, setCurrentLng] = useState(initialLng);
  const [isMapReady, setIsMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current || mapRef.current) {
      return;
    }

    const initMap = async () => {
      try {
        const L = (await import("leaflet")).default;

        if (!mapContainerRef.current || (mapContainerRef.current as any)._leaflet_id) {
          return;
        }

        // Fix marker icons
        delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });

        // Create map with high zoom for precise positioning (zoom 17-18 for street-level)
        const map = L.map(mapContainerRef.current).setView([initialLat, initialLng], 18);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        // Create draggable marker
        const marker = L.marker([initialLat, initialLng], {
          draggable: true,
        }).addTo(map);

        marker.bindPopup(`
          <div>
            <b>Position anpassen</b><br/>
            Ziehe die Markierung an die richtige Stelle
          </div>
        `).openPopup();

        // Update coordinates on drag
        marker.on("dragend", (event: DragEndEvent) => {
          const position = event.target.getLatLng();
          setCurrentLat(position.lat);
          setCurrentLng(position.lng);

          // Update popup with new coordinates
          marker.setPopupContent(`
            <div>
              <b>Position anpassen</b><br/>
              Ziehe die Markierung an die richtige Stelle<br/>
              <small style="color: #666; margin-top: 4px; display: block;">
                Lat: ${position.lat.toFixed(6)}<br/>
                Lng: ${position.lng.toFixed(6)}
              </small>
            </div>
          `);
        });

        mapRef.current = map;
        markerRef.current = marker;
        setIsMapReady(true);

        // Ensure map renders correctly
        setTimeout(() => {
          map.invalidateSize();
        }, 100);
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
        setIsMapReady(false);
      }
    };
  }, [initialLat, initialLng]);

  const handleConfirm = () => {
    onConfirm(currentLat, currentLng);
  };

  const handleRecenter = () => {
    if (mapRef.current && markerRef.current) {
      const position = markerRef.current.getLatLng();
      mapRef.current.setView([position.lat, position.lng], 18);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 overflow-hidden flex flex-col" style={{ maxHeight: "90vh" }}>
        {/* Header */}
        <div className="bg-[#003366] text-white p-6">
          <h2 className="text-2xl font-bold mb-2">Position bestätigen</h2>
          <p className="text-sm opacity-90">{address}</p>
        </div>

        {/* Map Container */}
        <div className="relative flex-1 min-h-[400px]">
          {/* Leaflet CSS */}
          <link
            rel="stylesheet"
            href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
            integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
            crossOrigin=""
          />

          <div ref={mapContainerRef} className="w-full h-full" />

          {!isMapReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <p className="text-gray-600">Karte wird geladen...</p>
            </div>
          )}

          {/* Coordinates Display */}
          {isMapReady && (
            <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
              <div className="text-xs font-bold text-gray-700 mb-1">Aktuelle Position:</div>
              <div className="text-xs text-gray-600 font-mono">
                <div>Lat: {currentLat.toFixed(6)}</div>
                <div>Lng: {currentLng.toFixed(6)}</div>
              </div>
            </div>
          )}

          {/* Recenter Button */}
          {isMapReady && (
            <button
              onClick={handleRecenter}
              className="absolute top-4 right-4 bg-white text-[#003366] p-2 rounded-lg shadow-lg hover:bg-gray-50 z-[1000]"
              title="Karte auf Pin zentrieren"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </button>
          )}
        </div>

        {/* Instructions and Actions */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>💡 Tipp:</strong> Ziehe die rote Markierung auf der Karte, um die Position präzise anzupassen.
              Die Koordinaten werden automatisch aktualisiert.
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors"
            >
              Abbrechen
            </button>
            <button
              onClick={handleConfirm}
              className="px-6 py-3 bg-[#003366] text-white rounded-lg font-bold hover:bg-[#002244] transition-colors"
            >
              Position bestätigen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
