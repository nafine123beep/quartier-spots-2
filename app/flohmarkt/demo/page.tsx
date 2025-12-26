"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppHeader } from "../components/app/AppHeader";
import { TabNavigation } from "../components/app/TabNavigation";
import { SpotItem } from "../components/shared/SpotItem";
import { MapDrawer } from "../components/shared/MapDrawer";
import { Spot, AppTabType } from "../types";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import { useRef, useCallback } from "react";

// Demo spots for the Werderau neighborhood in Nuremberg
const DEMO_SPOTS: Spot[] = [
  {
    id: "demo-1",
    tenant_id: "demo",
    event_id: "demo",
    title: "Kinderspielzeug & Bücher",
    public_note: "Viele Kinderbücher, Spielzeug und Kinderkleidung Gr. 98-128. Auch LEGO und Playmobil!",
    street: "Werderstraße",
    house_number: "15",
    zip: "90431",
    city: "Nürnberg",
    address_raw: "Werderstraße 15, 90431 Nürnberg",
    address_public: true,
    lat: 49.4195,
    lng: 11.0580,
    geo_precision: "exact",
    contact_name: "Familie Müller",
    contact_email: "demo@example.com",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-2",
    tenant_id: "demo",
    event_id: "demo",
    title: "Vintage Kleidung & Accessoires",
    public_note: "Schöne Vintage-Kleidung aus den 70ern und 80ern. Taschen, Schmuck und Hüte.",
    street: "Fürther Straße",
    house_number: "42",
    zip: "90429",
    city: "Nürnberg",
    address_raw: "Fürther Straße 42, 90429 Nürnberg",
    address_public: true,
    lat: 49.4210,
    lng: 11.0620,
    geo_precision: "exact",
    contact_name: "Anna Schmidt",
    contact_email: "demo@example.com",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-3",
    tenant_id: "demo",
    event_id: "demo",
    title: "Haushaltsauflösung",
    public_note: "Komplette Haushaltsauflösung: Geschirr, Besteck, Töpfe, Lampen, Dekoartikel. Alles muss raus!",
    street: "Sigmundstraße",
    house_number: "8",
    zip: "90431",
    city: "Nürnberg",
    address_raw: "Sigmundstraße 8, 90431 Nürnberg",
    address_public: true,
    lat: 49.4185,
    lng: 11.0550,
    geo_precision: "exact",
    contact_name: "Herr Weber",
    contact_email: "demo@example.com",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-4",
    tenant_id: "demo",
    event_id: "demo",
    title: "Elektronik & Technik",
    public_note: "Alte Handys, Laptops, Kabel, Ladegeräte. Auch Vintage-Radios und Plattenspieler!",
    street: "Rothenburger Straße",
    house_number: "124",
    zip: "90439",
    city: "Nürnberg",
    address_raw: "Rothenburger Straße 124, 90439 Nürnberg",
    address_public: true,
    lat: 49.4220,
    lng: 11.0490,
    geo_precision: "exact",
    contact_name: "Tech-Max",
    contact_email: "demo@example.com",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-5",
    tenant_id: "demo",
    event_id: "demo",
    title: "Garten & Outdoor",
    public_note: "Blumentöpfe, Gartengeräte, Gartenmöbel, Sonnenschirm. Auch Fahrräder für Kinder.",
    street: "Schwabacher Straße",
    house_number: "55",
    zip: "90439",
    city: "Nürnberg",
    address_raw: "Schwabacher Straße 55, 90439 Nürnberg",
    address_public: true,
    lat: 49.4170,
    lng: 11.0510,
    geo_precision: "exact",
    contact_name: "Garten-Lena",
    contact_email: "demo@example.com",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-6",
    tenant_id: "demo",
    event_id: "demo",
    title: "Schallplatten & CDs",
    public_note: "Große Sammlung: Rock, Pop, Jazz, Klassik. Auch seltene Vinyl-Schätze dabei!",
    street: "Sandreuthstraße",
    house_number: "17",
    zip: "90441",
    city: "Nürnberg",
    address_raw: "Sandreuthstraße 17, 90441 Nürnberg",
    address_public: true,
    lat: 49.4155,
    lng: 11.0600,
    geo_precision: "exact",
    contact_name: "DJ Marcus",
    contact_email: "demo@example.com",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-7",
    tenant_id: "demo",
    event_id: "demo",
    title: "Sportartikel",
    public_note: "Ski, Snowboard, Tennisschläger, Fußbälle, Inline-Skates. Für die ganze Familie!",
    street: "Hintere Marktstraße",
    house_number: "3",
    zip: "90403",
    city: "Nürnberg",
    address_raw: "Hintere Marktstraße 3, 90403 Nürnberg",
    address_public: true,
    lat: 49.4200,
    lng: 11.0700,
    geo_precision: "exact",
    contact_name: "Sport-Familie Bauer",
    contact_email: "demo@example.com",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-8",
    tenant_id: "demo",
    event_id: "demo",
    title: "Kunst & Handwerk",
    public_note: "Selbstgemachte Töpferware, Strickwaren, Gemälde und Drucke. Unikate!",
    street: "Steinbühler Straße",
    house_number: "29",
    zip: "90443",
    city: "Nürnberg",
    address_raw: "Steinbühler Straße 29, 90443 Nürnberg",
    address_public: true,
    lat: 49.4230,
    lng: 11.0560,
    geo_precision: "exact",
    contact_name: "Kunsthandwerk Petra",
    contact_email: "demo@example.com",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

function DemoListView({ spots, onSpotClick }: { spots: Spot[]; onSpotClick: (spot: Spot) => void }) {
  return (
    <div className="h-full overflow-y-auto p-5">
      <div className="max-w-[800px] mx-auto pb-20">
        <h2 className="text-[#003366] mt-0">Alle Spots</h2>
        <p className="text-gray-500 text-sm mb-4">Dies ist eine Demo-Ansicht mit Beispieldaten.</p>

        {spots.map((spot) => (
          <SpotItem
            key={spot.id}
            spot={spot}
            showDeleteButton={false}
            onClick={() => onSpotClick(spot)}
          />
        ))}
      </div>
    </div>
  );
}

function DemoMapView({ spots }: { spots: Spot[] }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<LeafletMarker[]>([]);

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

      // Center on Werderau area
      const map = L.map(mapContainerRef.current!).setView([49.4195, 11.0580], 14);
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
  }, []);

  // Update markers when map is ready
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
            <b>${spot.title || spot.address_raw || "-"}</b><br/>
            <small>${spot.address_raw || ""}</small><br/>
            <p style="margin: 8px 0;">${spot.public_note || "-"}</p>
          </div>
        `;

        const marker = L.marker([spot.lat, spot.lng])
          .addTo(map)
          .bindPopup(popupContent);

        markersRef.current.push(marker);
      });

      // Fit bounds to show all markers
      if (spots.length > 0) {
        const bounds = L.latLngBounds(
          spots
            .filter((s) => s.lat != null && s.lng != null)
            .map((s) => [s.lat!, s.lng!])
        );
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    };

    updateMarkers();
  }, [spots, isMapReady]);

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

      {/* Demo badge */}
      <div className="absolute top-4 right-4 z-[1000] bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold shadow">
        Demo-Modus
      </div>
    </div>
  );
}

function DemoPageContent() {
  const searchParams = useSearchParams();
  const [currentTab, setCurrentTab] = useState<AppTabType>("map");

  // Set initial tab from query param
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["list", "map"].includes(tab)) {
      setCurrentTab(tab as AppTabType);
    }
  }, [searchParams]);

  const handleSpotClick = () => {
    setCurrentTab("map");
  };

  return (
    <div className="fixed inset-0 flex flex-col z-[3000]">
      {/* Demo Header */}
      <header className="bg-[#003366] text-white px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold m-0">QuartierSpots Demo</h1>
        <a
          href="/flohmarkt"
          className="text-white/80 hover:text-white text-sm no-underline"
        >
          ← Zurück
        </a>
      </header>

      {/* Tab Navigation */}
      <nav className="bg-white border-b border-gray-200 flex">
        <button
          onClick={() => setCurrentTab("map")}
          className={`flex-1 py-3 px-4 font-semibold transition-colors ${
            currentTab === "map"
              ? "text-[#003366] border-b-2 border-[#003366]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          🗺️ Karte
        </button>
        <button
          onClick={() => setCurrentTab("list")}
          className={`flex-1 py-3 px-4 font-semibold transition-colors ${
            currentTab === "list"
              ? "text-[#003366] border-b-2 border-[#003366]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          📋 Liste
        </button>
      </nav>

      <div className="relative flex-grow overflow-hidden bg-gray-200">
        {currentTab === "list" && (
          <DemoListView spots={DEMO_SPOTS} onSpotClick={handleSpotClick} />
        )}
        {currentTab === "map" && <DemoMapView spots={DEMO_SPOTS} />}
      </div>
    </div>
  );
}

export default function DemoPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
        <p>Laden...</p>
      </div>
    }>
      <DemoPageContent />
    </Suspense>
  );
}
