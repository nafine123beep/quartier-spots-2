"use client";

import { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Spot, CustomHighlightType } from '../../../types';
import { sortSpotsForPrint } from '../../../lib/printUtils';
import { getHighlightIcon, getHighlightTypeLabel } from '../../../lib/highlightConfig';
import type { Map as LeafletMap, Marker as LeafletMarker, Circle as LeafletCircle } from 'leaflet';

interface PrintPreviewMapProps {
  spots: Spot[];
  highlights: Spot[];
  customHighlightTypes: CustomHighlightType[];
  initialCenter: [number, number];
  initialZoom: number;
  boundaryRadius?: number | null;
}

export interface PrintPreviewMapRef {
  getMapInstance: () => LeafletMap | null;
  captureAsImage: () => Promise<string>;
}

export const PrintPreviewMap = forwardRef<PrintPreviewMapRef, PrintPreviewMapProps>(
  function PrintPreviewMap({
    spots,
    highlights,
    customHighlightTypes,
    initialCenter,
    initialZoom,
    boundaryRadius,
  }, ref) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<LeafletMap | null>(null);
    const markersRef = useRef<LeafletMarker[]>([]);
    const highlightMarkersRef = useRef<LeafletMarker[]>([]);
    const boundaryCircleRef = useRef<LeafletCircle | null>(null);
    const [isReady, setIsReady] = useState(false);

    // Sort spots consistently for numbering
    const sortedSpots = sortSpotsForPrint(spots);

    // Create numbered marker icon for spots
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createNumberedIcon = useCallback((L: any, number: number) => {
      // Adjust font size based on number of digits
      const fontSize = number > 99 ? '10' : number > 9 ? '12' : '14';

      return L.divIcon({
        html: `
          <div style="
            width: 32px;
            height: 32px;
            background: #003366;
            border: 3px solid white;
            border-radius: 50%;
            color: white;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${fontSize}px;
            box-shadow: 0 3px 8px rgba(0,0,0,0.4);
            font-family: Arial, sans-serif;
          ">${number}</div>
        `,
        className: 'numbered-marker-print',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });
    }, []);

    // Create highlight icon (emoji in yellow circle)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createHighlightIcon = useCallback((L: any, icon: string, label: string) => {
      return L.divIcon({
        html: `
          <div style="text-align: center;">
            <div style="
              width: 40px;
              height: 40px;
              border-radius: 50%;
              background-color: #FFC107;
              border: 3px solid #FF9800;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 22px;
              box-shadow: 0 3px 8px rgba(0,0,0,0.4);
              margin: 0 auto;
            ">${icon}</div>
          </div>
        `,
        className: 'highlight-marker-print',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });
    }, []);

    // Initialize map
    useEffect(() => {
      if (typeof window === 'undefined' || !mapContainerRef.current) {
        return;
      }

      // Skip if map already exists
      if (mapRef.current) {
        return;
      }

      // Check if container already has Leaflet attached
      const container = mapContainerRef.current;
      if ((container as any)._leaflet_id) {
        return;
      }

      const initMap = async () => {
        try {
          const L = (await import('leaflet')).default;

          if (!mapContainerRef.current || (mapContainerRef.current as any)._leaflet_id) {
            return;
          }

          // Fix marker icons
          delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
          L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          });

          const map = L.map(mapContainerRef.current).setView(initialCenter, initialZoom);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap',
          }).addTo(map);

          // Add boundary circle if configured
          if (boundaryRadius && initialCenter[0] && initialCenter[1]) {
            const circle = L.circle(initialCenter, {
              radius: boundaryRadius,
              color: '#003366',
              weight: 2,
              fillColor: '#003366',
              fillOpacity: 0.05,
              dashArray: '10, 5',
            }).addTo(map);
            boundaryCircleRef.current = circle;
          }

          mapRef.current = map;
          setIsReady(true);
        } catch (error) {
          console.error('Error initializing print preview map:', error);
        }
      };

      initMap();

      return () => {
        if (mapRef.current) {
          markersRef.current.forEach(marker => marker.remove());
          highlightMarkersRef.current.forEach(marker => marker.remove());
          if (boundaryCircleRef.current) {
            boundaryCircleRef.current.remove();
          }
          mapRef.current.remove();
          mapRef.current = null;
          boundaryCircleRef.current = null;
          setIsReady(false);
        }
      };
    }, [initialCenter, initialZoom, boundaryRadius]);

    // Update markers when spots/highlights change
    useEffect(() => {
      if (!isReady || !mapRef.current) return;

      const updateMarkers = async () => {
        const L = (await import('leaflet')).default;
        const map = mapRef.current!;

        // Remove existing markers
        markersRef.current.forEach(marker => map.removeLayer(marker));
        highlightMarkersRef.current.forEach(marker => map.removeLayer(marker));
        markersRef.current = [];
        highlightMarkersRef.current = [];

        // Add numbered markers for spots (using sorted order)
        sortedSpots.forEach((spot, index) => {
          if (spot.lat == null || spot.lng == null) return;

          const number = index + 1;
          const marker = L.marker([spot.lat, spot.lng], {
            icon: createNumberedIcon(L, number),
          }).addTo(map);

          // Add tooltip showing address
          marker.bindTooltip(`#${number}: ${spot.address_raw || spot.street || 'Spot'}`, {
            permanent: false,
            direction: 'top',
            offset: [0, -20],
          });

          markersRef.current.push(marker);
        });

        // Add highlight markers
        highlights.forEach((highlight) => {
          if (highlight.lat == null || highlight.lng == null) return;

          const icon = highlight.highlight_icon || getHighlightIcon(highlight.highlight_type || '', customHighlightTypes);
          const label = highlight.title || getHighlightTypeLabel(highlight.highlight_type || '', customHighlightTypes);

          const marker = L.marker([highlight.lat, highlight.lng], {
            icon: createHighlightIcon(L, icon, label),
            zIndexOffset: 1000, // Render above regular spots
          }).addTo(map);

          // Add tooltip showing label
          marker.bindTooltip(label, {
            permanent: false,
            direction: 'top',
            offset: [0, -20],
          });

          highlightMarkersRef.current.push(marker);
        });
      };

      updateMarkers();
    }, [sortedSpots, highlights, isReady, customHighlightTypes, createNumberedIcon, createHighlightIcon]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      getMapInstance: () => mapRef.current,

      captureAsImage: async () => {
        if (!mapRef.current || !mapContainerRef.current) {
          throw new Error('Map not ready for capture');
        }

        // Wait a bit for tiles to load
        await new Promise(resolve => setTimeout(resolve, 500));

        // Invalidate map size to ensure proper rendering
        mapRef.current.invalidateSize();
        await new Promise(resolve => setTimeout(resolve, 200));

        const html2canvas = (await import('html2canvas')).default;

        const canvas = await html2canvas(mapContainerRef.current, {
          useCORS: true,
          allowTaint: false,
          scale: 2, // Higher resolution for print
          logging: false,
          backgroundColor: '#f3f4f6',
        });

        return canvas.toDataURL('image/png');
      },
    }));

    return (
      <div className="relative w-full h-full">
        {/* Leaflet CSS */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />

        {/* Map Container */}
        <div
          ref={mapContainerRef}
          className="w-full h-full"
          style={{ minHeight: '400px' }}
        />

        {/* Loading state */}
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366] mx-auto mb-2"></div>
              <p className="text-gray-600">Karte wird geladen...</p>
            </div>
          </div>
        )}

        {/* Instructions overlay */}
        {isReady && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md text-sm text-gray-700 max-w-xs">
            <p className="m-0">
              <span className="font-bold text-[#003366]">Tipp:</span> Verschieben und zoomen Sie die Karte, um den gewünschten Ausschnitt für das PDF zu wählen.
            </p>
          </div>
        )}
      </div>
    );
  }
);
