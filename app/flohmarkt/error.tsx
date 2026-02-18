"use client";

import Link from "next/link";

export default function FlohmarktError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-5">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
        <h1 className="text-3xl font-bold text-[#003366] mb-2">
          Ein Fehler ist aufgetreten
        </h1>
        <p className="text-gray-600 mb-6">
          Beim Laden dieser Seite ist ein Fehler aufgetreten.
          Bitte versuche es erneut oder kehre zum Dashboard zurück.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={reset}
            className="bg-[#003366] text-white px-6 py-3 rounded-md font-bold cursor-pointer hover:bg-[#002244]"
          >
            Erneut versuchen
          </button>
          <Link
            href="/flohmarkt/organizations"
            className="inline-block bg-white border-2 border-[#003366] text-[#003366] px-6 py-3 rounded-md font-bold hover:bg-gray-50 no-underline"
          >
            Zum Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
