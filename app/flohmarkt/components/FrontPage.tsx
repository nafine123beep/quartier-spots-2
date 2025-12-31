"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Map as LeafletMap } from "leaflet";
import { SupportFormModal } from "./shared/SupportFormModal";

export function FrontPage() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  // Initialize background map
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current || mapRef.current) {
      return;
    }

    const initMap = async () => {
      const L = (await import("leaflet")).default;

      const map = L.map(mapContainerRef.current!, {
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        attributionControl: false,
      }).setView([49.42, 11.06], 15);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

      mapRef.current = map;
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[3000] bg-[#003366]">
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />

      {/* Background Map */}
      <div
        ref={mapContainerRef}
        className="absolute inset-0 z-0 opacity-60 grayscale contrast-125"
        style={{ filter: "grayscale(80%) contrast(1.2)" }}
      />

      {/* Overlay */}
      <div className="relative z-10 h-full w-full bg-[rgba(0,51,102,0.85)] flex flex-col justify-center items-center p-5">
        {/* Content Box */}
        <main className="bg-white p-8 rounded-xl w-full max-w-[400px] text-center shadow-2xl my-auto">
          <header>
            <h1 className="text-[#003366] m-0 mb-2 text-2xl">QuartierSpots</h1>
            <p className="text-gray-600 mb-6">
              Die Plattform für Hof-Flohmärkte und Nachbarschafts-Events.
            </p>
          </header>

          <div className="flex flex-col gap-4 w-full">
            {/* Demo Button - Combined */}
            <Link
              href="/flohmarkt/demo"
              className="text-lg font-bold p-4 border border-gray-300 border-b-[3px] border-b-gray-400 rounded-lg bg-gray-100 text-gray-800 cursor-pointer hover:bg-gray-200 transition-colors text-center no-underline"
            >
              🗺️ Demo ansehen
            </Link>

            {/* Login/Registration - Primary CTA */}
            <Link
              href="/auth/login"
              className="text-lg font-bold p-4 rounded-lg bg-[#003366] text-white cursor-pointer hover:bg-[#004488] transition-colors text-center no-underline shadow-md"
            >
              Anmelden / Registrieren
            </Link>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-5 flex gap-5 text-sm">
          <button
            onClick={() => setIsSupportModalOpen(true)}
            className="text-gray-400 no-underline border-b border-dotted border-gray-400 pb-0.5 cursor-pointer hover:text-white hover:border-solid bg-transparent border-t-0 border-l-0 border-r-0"
          >
            Kontakt & Support
          </button>
        </footer>

        {/* Support Form Modal */}
        <SupportFormModal
          isOpen={isSupportModalOpen}
          onClose={() => setIsSupportModalOpen(false)}
        />
      </div>
    </div>
  );
}
