"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useFlohmarkt } from "../../FlohmarktContext";
import { MapDrawer } from "../shared/MapDrawer";
import { SpotItem } from "../shared/SpotItem";
import { ContactFormModal } from "../shared/ContactFormModal";
import { Spot } from "../../types";
import { getSpotTerms } from "../../lib/spotTerms";
import type { Map as LeafletMap, Marker as LeafletMarker, Circle as LeafletCircle } from "leaflet";

export function MapView() {
  const { spots, setCurrentTab, setDeletePreFill, currentTenantEvent, currentTenant } = useFlohmarkt();
  const terms = getSpotTerms(currentTenantEvent?.spot_term_singular, currentTenantEvent?.spot_term_plural);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<LeafletMarker[]>([]);
  const boundaryCircleRef = useRef<LeafletCircle | null>(null);

  const handleDelete = useCallback((addressRaw: string) => {
    setDeletePreFill(addressRaw);
    setCurrentTab("delete");
  }, [setDeletePreFill, setCurrentTab]);

  // Initialize map
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) {
      return;
    }

    // Skip if map already exists
    if (mapRef.current) {
      return;
    }

    // Check if container already has Leaflet attached (prevent double initialization)
    const container = mapContainerRef.current;
    if ((container as any)._leaflet_id) {
      console.warn("Map container already has Leaflet initialized, skipping");
      return;
    }

    const initMap = async () => {
      try {
        const L = (await import("leaflet")).default;

        // Ensure container still exists and isn't initialized
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

        // Use event's map center if available, otherwise use default coordinates
        const defaultLat = currentTenantEvent?.map_center_lat ?? 49.42;
        const defaultLng = currentTenantEvent?.map_center_lng ?? 11.06;
        const map = L.map(mapContainerRef.current).setView([defaultLat, defaultLng], 14);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        // Add boundary circle if event has boundary restriction
        if (currentTenantEvent?.boundary_radius_meters &&
            currentTenantEvent.map_center_lat &&
            currentTenantEvent.map_center_lng) {
          const boundaryCircle = L.circle(
            [currentTenantEvent.map_center_lat, currentTenantEvent.map_center_lng],
            {
              radius: currentTenantEvent.boundary_radius_meters,
              color: '#003366',
              weight: 2,
              fillColor: '#003366',
              fillOpacity: 0.05,
              dashArray: '10, 5',
            }
          ).addTo(map);
          boundaryCircleRef.current = boundaryCircle;
        }

        mapRef.current = map;
        setIsMapReady(true);
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        boundaryCircleRef.current = null;
        setIsMapReady(false);
      }
    };
  }, [currentTenantEvent?.map_center_lat, currentTenantEvent?.map_center_lng, currentTenantEvent?.boundary_radius_meters]);

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
              🗑️ ${terms.deleteSpot}
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
        title={terms.spotsNearby}
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
      <button
        onClick={() => setIsContactModalOpen(true)}
        className="
          absolute bottom-5 right-5 w-14 h-14
          bg-[#FFCC00] text-[#003366] rounded-full
          flex items-center justify-center text-3xl
          shadow-lg z-[2500] border-none cursor-pointer
          hover:scale-110 transition-transform
        "
        title="Veranstalter:in kontaktieren"
      >
        ✉️
      </button>

      {/* Contact Form Modal */}
      <ContactFormModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        tenantId={currentTenant?.id || ""}
        tenantName={currentTenant?.name || ""}
        eventId={currentTenantEvent?.id}
        eventTitle={currentTenantEvent?.title}
        spotQuestionLabel={terms.questionAboutSpot}
      />
    </div>
  );
}
