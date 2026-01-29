"use client";

import { useRef, useEffect, useState, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import { Spot, CustomHighlightType } from '../../../types';
import { sortSpotsForPrint } from '../../../lib/printUtils';
import { getHighlightIcon, getHighlightTypeLabel } from '../../../lib/highlightConfig';
import { iconToSvgString } from '../../../lib/iconResolver';
import { Star } from '@/app/flohmarkt/components/icons';
import type { Map as LeafletMap, Marker as LeafletMarker, Circle as LeafletCircle, LatLngBounds } from 'leaflet';

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
  fitToMarkers: () => void;
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

    // Sort spots consistently for numbering (memoized to prevent render loops)
    const sortedSpots = useMemo(() => sortSpotsForPrint(spots), [spots]);

    // Create numbered marker icon for spots - larger and more visible
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createNumberedIcon = useCallback((L: any, number: number) => {
      // Adjust font size based on number of digits
      const fontSize = number > 99 ? '12' : number > 9 ? '14' : '16';

      return L.divIcon({
        html: `
          <div style="
            width: 36px;
            height: 36px;
            background: #003366;
            border: 4px solid white;
            border-radius: 50%;
            color: white;
            font-weight: 900;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${fontSize}px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5), 0 0 0 2px #003366;
            font-family: Arial, Helvetica, sans-serif;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
          ">${number}</div>
        `,
        className: 'numbered-marker-print',
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });
    }, []);

    // Create highlight icon with SVG for better rendering
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createHighlightIcon = useCallback((L: any, iconSvg: string, label: string) => {
      return L.divIcon({
        html: `
          <div style="text-align: center;">
            <div style="
              min-width: 50px;
              padding: 8px 12px;
              background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
              border: 3px solid #d97706;
              border-radius: 8px;
              color: #1f2937;
              font-weight: 900;
              font-size: 11px;
              font-family: Arial, Helvetica, sans-serif;
              box-shadow: 0 4px 12px rgba(0,0,0,0.4);
              white-space: nowrap;
              letter-spacing: 0.5px;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 6px;
            ">${iconSvg}</div>
          </div>
        `,
        className: 'highlight-marker-print',
        iconSize: [60, 40],
        iconAnchor: [30, 40],
      });
    }, []);

    // Fit map to show all markers
    const fitToMarkers = useCallback(() => {
      if (!mapRef.current) return;

      const allCoords: [number, number][] = [];

      // Collect all spot coordinates
      sortedSpots.forEach(spot => {
        if (spot.lat != null && spot.lng != null) {
          allCoords.push([spot.lat, spot.lng]);
        }
      });

      // Collect all highlight coordinates
      highlights.forEach(highlight => {
        if (highlight.lat != null && highlight.lng != null) {
          allCoords.push([highlight.lat, highlight.lng]);
        }
      });

      if (allCoords.length > 0) {
        import('leaflet').then(L => {
          const bounds = L.default.latLngBounds(allCoords);
          mapRef.current?.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 16,
          });
        });
      }
    }, [sortedSpots, highlights]);

    // Ref to call fitToMarkers from init effect without it being a dependency
    const fitToMarkersRef = useRef(fitToMarkers);
    fitToMarkersRef.current = fitToMarkers;

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((container as any)._leaflet_id) {
        return;
      }

      const initMap = async () => {
        try {
          const L = (await import('leaflet')).default;

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

          const map = L.map(mapContainerRef.current, {
            zoomControl: true,
            attributionControl: false, // Hide attribution for cleaner print
          }).setView(initialCenter, initialZoom);

          // Use a cleaner tile layer for print
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '',
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

          // Auto-fit to markers after a short delay
          setTimeout(() => {
            fitToMarkersRef.current();
          }, 500);
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
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
            offset: [0, -25],
            className: 'print-tooltip',
          });

          markersRef.current.push(marker);
        });

        // Add highlight markers
        highlights.forEach((highlight) => {
          if (highlight.lat == null || highlight.lng == null) return;

          const typeKey = highlight.highlight_type || '';
          const label = highlight.title || getHighlightTypeLabel(typeKey, customHighlightTypes);
          const iconValue = getHighlightIcon(typeKey, customHighlightTypes);
          const iconSvg = iconToSvgString(iconValue, 20, '#1f2937');

          const marker = L.marker([highlight.lat, highlight.lng], {
            icon: createHighlightIcon(L, iconSvg, label),
            zIndexOffset: 1000, // Render above regular spots
          }).addTo(map);

          // Add tooltip showing label
          marker.bindTooltip(label, {
            permanent: false,
            direction: 'top',
            offset: [0, -20],
            className: 'print-tooltip',
          });

          highlightMarkersRef.current.push(marker);
        });
      };

      updateMarkers();
    }, [sortedSpots, highlights, isReady, customHighlightTypes, createNumberedIcon, createHighlightIcon]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      getMapInstance: () => mapRef.current,

      fitToMarkers,

      captureAsImage: async () => {
        if (!mapRef.current || !mapContainerRef.current) {
          throw new Error('Map not ready for capture');
        }

        const map = mapRef.current;

        // Wait for tiles to fully load
        await new Promise(resolve => setTimeout(resolve, 1000));
        map.invalidateSize();
        await new Promise(resolve => setTimeout(resolve, 500));

        const html2canvas = (await import('html2canvas')).default;
        const scale = 2.5;

        // Capture just the base map (tiles). html2canvas can't reliably
        // render Leaflet divIcon markers, so we skip them and draw manually.
        const canvas = await html2canvas(mapContainerRef.current, {
          useCORS: true,
          allowTaint: false,
          scale,
          logging: false,
          backgroundColor: '#ffffff',
          removeContainer: false,
          ignoreElements: (el: Element) => {
            return el.classList?.contains('leaflet-marker-pane') === true;
          },
        });

        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');

        // Convert lat/lng to container pixel coordinates using pure math.
        // Avoids latLngToContainerPoint which depends on _leaflet_pos DOM state.
        const zoom = map.getZoom();
        const center = map.getCenter();
        const size = map.getSize(); // container size in CSS pixels
        const centerPixel = map.project(center, zoom);

        const toContainerXY = (lat: number, lng: number): { x: number; y: number } => {
          const pixel = map.project([lat, lng], zoom);
          return {
            x: (pixel.x - centerPixel.x + size.x / 2) * scale,
            y: (pixel.y - centerPixel.y + size.y / 2) * scale,
          };
        };

        // Helper: draw a rounded rectangle (polyfill for older browsers)
        const drawRoundedRect = (
          x: number, y: number, w: number, h: number, r: number
        ) => {
          ctx.beginPath();
          ctx.moveTo(x + r, y);
          ctx.lineTo(x + w - r, y);
          ctx.quadraticCurveTo(x + w, y, x + w, y + r);
          ctx.lineTo(x + w, y + h - r);
          ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
          ctx.lineTo(x + r, y + h);
          ctx.quadraticCurveTo(x, y + h, x, y + h - r);
          ctx.lineTo(x, y + r);
          ctx.quadraticCurveTo(x, y, x + r, y);
          ctx.closePath();
        };

        // Draw numbered spot markers
        sortedSpots.forEach((spot, index) => {
          if (spot.lat == null || spot.lng == null) return;

          const { x, y } = toContainerXY(spot.lat, spot.lng);
          const r = 18 * scale;
          const number = index + 1;

          // White border + shadow effect
          ctx.beginPath();
          ctx.arc(x, y - r, r + 2 * scale, 0, Math.PI * 2);
          ctx.fillStyle = 'white';
          ctx.fill();

          // Dark blue circle
          ctx.beginPath();
          ctx.arc(x, y - r, r, 0, Math.PI * 2);
          ctx.fillStyle = '#003366';
          ctx.fill();

          // Outer ring
          ctx.strokeStyle = '#003366';
          ctx.lineWidth = 2 * scale;
          ctx.beginPath();
          ctx.arc(x, y - r, r + 2 * scale, 0, Math.PI * 2);
          ctx.stroke();

          // Number text
          const fontSize = (number > 99 ? 12 : number > 9 ? 14 : 16) * scale;
          ctx.font = `900 ${fontSize}px Arial, Helvetica, sans-serif`;
          ctx.fillStyle = 'white';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(number), x, y - r);
        });

        // Draw highlight markers
        highlights.forEach((highlight) => {
          if (highlight.lat == null || highlight.lng == null) return;

          const { x, y } = toContainerXY(highlight.lat, highlight.lng);
          const label = highlight.title || getHighlightTypeLabel(
            highlight.highlight_type || '', customHighlightTypes
          );

          // Measure text for box sizing
          const fontSize = 11 * scale;
          ctx.font = `900 ${fontSize}px Arial, Helvetica, sans-serif`;
          const textWidth = ctx.measureText(label).width;
          const padX = 12 * scale;
          const padY = 8 * scale;
          const boxW = textWidth + padX * 2;
          const boxH = fontSize + padY * 2;
          const bx = x - boxW / 2;
          const by = y - boxH;
          const borderR = 8 * scale;

          // Amber filled box
          drawRoundedRect(bx, by, boxW, boxH, borderR);
          ctx.fillStyle = '#f59e0b';
          ctx.fill();
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 3 * scale;
          ctx.stroke();

          // Label text
          ctx.fillStyle = '#1f2937';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(label, x, by + boxH / 2);
        });

        return canvas.toDataURL('image/png', 1.0);
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

        {/* Custom styles for print markers */}
        <style>{`
          .numbered-marker-print,
          .highlight-marker-print {
            background: transparent !important;
            border: none !important;
          }
          .print-tooltip {
            font-weight: bold;
            font-size: 12px;
            padding: 6px 10px;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          }
        `}</style>

        {/* Map Container */}
        <div
          ref={mapContainerRef}
          className="w-full h-full"
          style={{ minHeight: '400px', background: '#f3f4f6' }}
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

        {/* Instructions and controls overlay */}
        {isReady && (
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start pointer-events-none">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md text-sm text-gray-700 max-w-xs pointer-events-auto">
              <p className="m-0">
                <span className="font-bold text-[#003366]">Tipp:</span> Verschieben und zoomen Sie die Karte.
              </p>
            </div>

            <button
              onClick={fitToMarkers}
              className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md text-sm font-medium text-[#003366] hover:bg-gray-50 pointer-events-auto transition-colors"
            >
              Alle anzeigen
            </button>
          </div>
        )}

        {/* Legend overlay */}
        {isReady && (sortedSpots.length > 0 || highlights.length > 0) && (
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md text-xs">
            <div className="font-bold text-gray-700 mb-1">Legende:</div>
            {sortedSpots.length > 0 && (
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 bg-[#003366] rounded-full flex items-center justify-center text-white text-[10px] font-bold border-2 border-white shadow">1</div>
                <span className="text-gray-600">= Spot (nummeriert)</span>
              </div>
            )}
            {highlights.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded p-1 flex items-center justify-center border border-amber-600">
                  <Star size={12} fill="#1f2937" color="#1f2937" aria-label="Highlight" />
                </div>
                <span className="text-gray-600">= Highlight</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);
