"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useFlohmarkt } from "../../FlohmarktContext";
import { MapDrawer } from "../shared/MapDrawer";
import { SpotItem } from "../shared/SpotItem";
import { ContactFormModal } from "../shared/ContactFormModal";
import { SpotCarousel } from "../shared/SpotCarousel";
import { Spot } from "../../types";
import { getSpotTerms } from "../../lib/spotTerms";
import { getHighlightIcon, getHighlightTypeLabel } from "../../lib/highlightConfig";
import { Emoji, EMOJIS } from "../icons";
import type { Map as LeafletMap, Marker as LeafletMarker, Circle as LeafletCircle } from "leaflet";

export function MapView() {
  const { spots, setCurrentTab, setDeletePreFill, currentTenant, currentTenantEvent, selectedSpotId, setSelectedSpotId, customHighlightTypes } = useFlohmarkt();
  const terms = getSpotTerms(currentTenantEvent?.spot_term_singular, currentTenantEvent?.spot_term_plural);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<LeafletMarker[]>([]);
  const highlightMarkersRef = useRef<LeafletMarker[]>([]);
  const boundaryCircleRef = useRef<LeafletCircle | null>(null);

  // Separate regular spots and highlights
  const regularSpots = useMemo(() => spots.filter(spot => !spot.is_highlight), [spots]);
  const highlights = useMemo(() => spots.filter(spot => spot.is_highlight), [spots]);

  const handleDelete = useCallback((addressRaw: string) => {
    setDeletePreFill(addressRaw);
    setCurrentTab("delete");
  }, [setDeletePreFill, setCurrentTab]);

  // Function to create custom divIcon for highlights
  const createHighlightIcon = useCallback((L: any, icon: string, label: string) => {
    return L.divIcon({
      html: `
        <div style="text-align: center;">
          <div style="
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background-color: #FFC107;
            border: 3px solid #FF9800;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          ">${icon}</div>
          <div class="highlight-label" style="
            margin-top: 4px;
            padding: 3px 8px;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 4px;
            font-size: 12px;
            font-weight: 700;
            color: #1f2937;
            white-space: nowrap;
            box-shadow: 0 2px 6px rgba(0,0,0,0.25);
            display: none;
          ">${label}</div>
        </div>
      `,
      className: 'highlight-marker',
      iconSize: [48, 72],
      iconAnchor: [24, 48],
    });
  }, []);

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
    };

    initMap();

    return () => {
      if (mapRef.current) {
        markersRef.current.forEach(marker => marker.remove());
        highlightMarkersRef.current.forEach(marker => marker.remove());
        mapRef.current.remove();
        mapRef.current = null;
        boundaryCircleRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTenantEvent?.map_center_lat, currentTenantEvent?.map_center_lng, currentTenantEvent?.boundary_radius_meters]);

  // Update markers when spots change
  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;

    const updateMarkers = async () => {
      const L = (await import("leaflet")).default;
      const map = mapRef.current!;

      // Remove existing markers
      markersRef.current.forEach((marker) => map.removeLayer(marker));
      highlightMarkersRef.current.forEach((marker) => map.removeLayer(marker));
      markersRef.current = [];
      highlightMarkersRef.current = [];

      // Add regular spot markers first
      regularSpots.forEach((spot) => {
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

      // Add highlight markers on top
      highlights.forEach((highlight) => {
        if (highlight.lat == null || highlight.lng == null) return;

        const icon = getHighlightIcon(highlight.highlight_type || '', customHighlightTypes);
        const label = highlight.title || getHighlightTypeLabel(highlight.highlight_type || '', customHighlightTypes);

        const popupContent = `
          <div>
            <div style="font-size: 20px; text-align: center;">${icon}</div>
            <b>${label}</b><br/>
            ${highlight.public_note ? `<p style="margin: 4px 0;">${highlight.public_note}</p>` : ''}
          </div>
        `;

        const marker = L.marker(
          [highlight.lat, highlight.lng],
          {
            icon: createHighlightIcon(L, icon, label),
            zIndexOffset: 1000  // Render above regular spots
          }
        )
          .addTo(map)
          .bindPopup(popupContent);

        highlightMarkersRef.current.push(marker);
      });
    };

    updateMarkers();
  }, [regularSpots, highlights, isMapReady, customHighlightTypes, terms.deleteSpot, createHighlightIcon]);

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
      if (spot.is_highlight) {
        const markerIndex = highlights.findIndex((s) => s.id === spot.id);
        if (markerIndex >= 0 && highlightMarkersRef.current[markerIndex]) {
          highlightMarkersRef.current[markerIndex].openPopup();
        }
      } else {
        const markerIndex = regularSpots.findIndex((s) => s.id === spot.id);
        if (markerIndex >= 0 && markersRef.current[markerIndex]) {
          markersRef.current[markerIndex].openPopup();
        }
      }
    }
    if (window.innerWidth < 768) {
      setIsDrawerOpen(false);
    }
  }, [regularSpots, highlights]);

  const toggleDrawer = () => {
    setIsDrawerOpen((prev) => !prev);
  };

  // Navigate to selected spot when coming from ListView
  useEffect(() => {
    if (selectedSpotId && isMapReady) {
      const spot = spots.find(s => s.id === selectedSpotId);
      if (spot) {
        handleSpotClick(spot);
        // Clear the selection after navigating
        setSelectedSpotId(null);
      }
    }
  }, [selectedSpotId, isMapReady, spots, handleSpotClick, setSelectedSpotId]);

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

      {/* Toggle List Button - Desktop only */}
      <button
        onClick={toggleDrawer}
        className="
          absolute bottom-5 left-5 z-[1000]
          bg-[#003366] text-white px-5 py-3 rounded-full
          font-bold shadow-lg cursor-pointer
          items-center gap-2
          hover:bg-[#002244]
          hidden md:flex
        "
      >
        <Emoji symbol={EMOJIS.MENU} label="Menu" /> Liste
      </button>

      {/* Drawer - Desktop only */}
      <div className="hidden md:block">
        <MapDrawer
          isOpen={isDrawerOpen}
          onClose={toggleDrawer}
          title={terms.spotsNearby}
        >
          {regularSpots.map((spot) => (
            <SpotItem
              key={spot.id}
              spot={spot}
              isCompact
              showDeleteButton={false}
              onClick={() => handleSpotClick(spot)}
            />
          ))}
        </MapDrawer>
      </div>

      {/* Mobile Carousel - Mobile only */}
      <div className="block md:hidden">
        <SpotCarousel
          spots={regularSpots}
          onSpotClick={handleSpotClick}
          spotTermSingular={currentTenantEvent?.spot_term_singular}
        />
      </div>

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
        <Emoji symbol={EMOJIS.EMAIL} label="Kontakt" size="lg" />
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
