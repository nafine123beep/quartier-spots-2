"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useFlohmarkt } from "../../FlohmarktContext";
import { MapDrawer } from "../shared/MapDrawer";
import { SpotItem } from "../shared/SpotItem";
import { Spot } from "../../types";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";

export function MapView() {
  const { spots, setCurrentTab, setDeletePreFill, currentTenantEvent } = useFlohmarkt();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<LeafletMarker[]>([]);

  const handleDelete = useCallback((addressRaw: string) => {
    setDeletePreFill(addressRaw);
    setCurrentTab("delete");
  }, [setDeletePreFill, setCurrentTab]);

  // Initialize map
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current || mapRef.current) {
      return;
    }

    const initMap = async () => {
      const L = (await import("leaflet")).default;

      // Fix marker icons
      delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Use event's map center if available, otherwise use default coordinates
      const defaultLat = currentTenantEvent?.map_center_lat ?? 49.42;
      const defaultLng = currentTenantEvent?.map_center_lng ?? 11.06;
      const map = L.map(mapContainerRef.current!).setView([defaultLat, defaultLng], 14);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      mapRef.current = map;
      setIsMapReady(true);
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [currentTenantEvent?.map_center_lat, currentTenantEvent?.map_center_lng]);

  // Update markers when spots change
  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;

    const updateMarkers = async () => {
      const L = (await import("leaflet")).default;
      const map = mapRef.current!;

      // Remove existing markers
      markersRef.current.forEach((marker) => map.removeLayer(marker));
      markersRef.current = [];

      // Add new markers
      spots.forEach((spot) => {
        if (spot.lat == null || spot.lng == null) return;

        const popupContent = `
          <div>
            <b>${spot.address_raw || "-"}</b><br/>
            ${spot.public_note || "-"}<br/>
            <button
              onclick="window.dispatchEvent(new CustomEvent('deleteSpot', { detail: '${spot.address_raw || ""}' }))"
              style="margin-top: 8px; color: #dc3545; border: 1px solid #dc3545; background: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; cursor: pointer;"
            >
              🗑️ Spot löschen
            </button>
          </div>
        `;

        const marker = L.marker([spot.lat, spot.lng])
          .addTo(map)
          .bindPopup(popupContent);

        markersRef.current.push(marker);
      });
    };

    updateMarkers();
  }, [spots, isMapReady]);

  // Listen for delete events from popup
  useEffect(() => {
    const handler = (e: CustomEvent<string>) => {
      handleDelete(e.detail);
    };

    window.addEventListener("deleteSpot", handler as EventListener);
    return () => window.removeEventListener("deleteSpot", handler as EventListener);
  }, [handleDelete]);

  const handleSpotClick = useCallback((spot: Spot) => {
    if (mapRef.current && spot.lat != null && spot.lng != null) {
      mapRef.current.setView([spot.lat, spot.lng], 16);

      // Find and open the marker's popup
      const markerIndex = spots.findIndex((s) => s.id === spot.id);
      if (markerIndex >= 0 && markersRef.current[markerIndex]) {
        markersRef.current[markerIndex].openPopup();
      }
    }
    if (window.innerWidth < 768) {
      setIsDrawerOpen(false);
    }
  }, [spots]);

  const toggleDrawer = () => {
    setIsDrawerOpen((prev) => !prev);
  };

  // Invalidate map size when it becomes visible
  useEffect(() => {
    if (isMapReady && mapRef.current) {
      setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 100);
    }
  }, [isMapReady]);

  return (
    <div className="h-full w-full relative">
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />

      {/* Map Container */}
      <div ref={mapContainerRef} className="h-full w-full z-[1]" />

      {/* Loading state */}
      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 z-[2]">
          <p>Karte wird geladen...</p>
        </div>
      )}

      {/* Toggle List Button */}
      <button
        onClick={toggleDrawer}
        className="
          absolute bottom-5 left-5 z-[1000]
          bg-[#003366] text-white px-5 py-3 rounded-full
          font-bold shadow-lg cursor-pointer
          flex items-center gap-2
          hover:bg-[#002244]
        "
      >
        <span>☰</span> Liste
      </button>

      {/* Drawer */}
      <MapDrawer
        isOpen={isDrawerOpen}
        onClose={toggleDrawer}
        title="Spots in der Nähe"
      >
        {spots.map((spot) => (
          <SpotItem
            key={spot.id}
            spot={spot}
            isCompact
            showDeleteButton={false}
            onClick={() => handleSpotClick(spot)}
          />
        ))}
      </MapDrawer>

      {/* Contact FAB */}
      <a
        href="mailto:info@werderau.de"
        className="
          absolute bottom-5 right-5 w-14 h-14
          bg-[#FFCC00] text-[#003366] rounded-full
          flex items-center justify-center text-3xl
          shadow-lg z-[2500] no-underline
          hover:scale-110 transition-transform
        "
        title="Veranstalter:in kontaktieren"
      >
        ✉️
      </a>
    </div>
  );
}
