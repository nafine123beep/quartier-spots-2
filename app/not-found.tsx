import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-5">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
        <h1 className="text-5xl font-bold text-[#003366] mb-2">404</h1>
        <h2 className="text-xl text-gray-700 mb-4">Seite nicht gefunden</h2>
        <p className="text-gray-600 mb-6">
          Die angeforderte Seite existiert nicht oder wurde verschoben.
        </p>
        <Link
          href="/flohmarkt"
          className="inline-block bg-[#003366] text-white px-6 py-3 rounded-md font-bold hover:bg-[#002244] no-underline"
        >
          Zur Startseite
        </Link>
      </div>
    </div>
  );
}
