"use client";

import { useFlohmarkt } from "../../FlohmarktContext";

export function EventControlPanel() {
  const { currentTenantEvent, currentTenant } = useFlohmarkt();

  if (!currentTenantEvent || !currentTenant) return null;

  const eventIdentifier = currentTenantEvent.slug || currentTenantEvent.id;
  const publicLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/flohmarkt/${currentTenant.slug}/${eventIdentifier}`;

  const copyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(publicLink).then(() => {
        alert("Link kopiert!");
      });
    } else {
      alert("Kopieren nicht unterstützt, bitte manuell markieren.");
    }
  };

  const goToPublicView = () => {
    window.open(publicLink, '_blank');
  };

  return (
    <div className="bg-white border border-gray-200 border-l-4 border-l-green-500 p-5 rounded-lg">
      <h3 className="mt-0 text-green-700 font-bold">
        Öffentlicher Link
      </h3>
      <p className="text-gray-900">Teile diesen Link mit Teilnehmern:</p>

      <div className="flex items-center gap-2.5 mt-2.5">
        <div className="flex-grow bg-gray-100 p-2.5 border border-gray-300 rounded font-mono break-all text-sm text-gray-900">
          {publicLink}
        </div>
        <button
          onClick={copyLink}
          title="Link kopieren"
          className="bg-gray-200 border border-gray-300 p-2.5 rounded cursor-pointer text-xl hover:bg-gray-300"
        >
          📋
        </button>
      </div>

      <div className="mt-4">
        <button
          onClick={goToPublicView}
          className="inline-block bg-[#FFCC00] text-[#003366] px-5 py-2.5 rounded-md font-bold cursor-pointer hover:bg-[#e6b800]"
        >
          Zur Teilnehmer-Ansicht
        </button>
      </div>
    </div>
  );
}
