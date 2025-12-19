"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function HomeContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const message = searchParams.get("message");
    const hashMessage = typeof window !== "undefined"
      ? new URLSearchParams(window.location.hash.replace("#", "")).get("message")
      : null;

    const confirmationMessage = message || hashMessage;

    // Check if this is an email confirmation redirect
    if (confirmationMessage && confirmationMessage.toLowerCase().includes("confirmation")) {
      // Redirect to settings page for email confirmation
      window.location.replace("/flohmarkt/settings");
      return;
    }

    // Default: redirect to flohmarkt
    window.location.replace("/flohmarkt");
  }, [searchParams]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366] mx-auto mb-4"></div>
        <h1 className="text-xl text-[#003366]">Weiterleitung...</h1>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366] mx-auto mb-4"></div>
          <h1 className="text-xl text-[#003366]">Laden...</h1>
        </div>
      </main>
    }>
      <HomeContent />
    </Suspense>
  );
}
