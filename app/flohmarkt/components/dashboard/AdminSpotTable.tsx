"use client";

import { useFlohmarkt } from "../../FlohmarktContext";

export function AdminSpotTable() {
  const { spots, deleteSpot, getAllEmails } = useFlohmarkt();

  const handleDelete = (id: string) => {
    if (confirm("Diesen Spot wirklich unwiderruflich löschen?")) {
      deleteSpot(id);
    }
  };

  const emailAllSpots = () => {
    const emails = getAllEmails();
    if (emails.length === 0) {
      alert("Keine gültigen E-Mail-Adressen gefunden.");
      return;
    }
    const mailtoLink = `mailto:?bcc=${emails.join(",")}&subject=Info zum Flohmarkt`;
    window.location.href = mailtoLink;
  };

  return (
    <div className="bg-white rounded-lg p-5 shadow-md overflow-x-auto">
      <h3 className="mt-0 border-b border-gray-200 pb-2.5 text-[#003366]">
        Verwaltung: Angemeldete Spots
      </h3>

      <table className="w-full border-collapse min-w-[600px]">
        <thead>
          <tr>
            <th className="text-left bg-gray-100 p-2.5 border-b-2 border-gray-300 text-[#003366]">
              Adresse / Spot
            </th>
            <th className="text-left bg-gray-100 p-2.5 border-b-2 border-gray-300 text-[#003366]">
              Beschreibung
            </th>
            <th className="text-left bg-gray-100 p-2.5 border-b-2 border-gray-300 text-[#003366]">
              Interne Daten (Privat)
            </th>
            <th className="text-left bg-gray-100 p-2.5 border-b-2 border-gray-300 text-[#003366]">
              Aktion
            </th>
          </tr>
        </thead>
        <tbody>
          {spots.map((spot) => (
            <tr key={spot.id} className="hover:bg-gray-50">
              <td className="p-2.5 border-b border-gray-100 align-top">
                <strong>{spot.address}</strong>
              </td>
              <td className="p-2.5 border-b border-gray-100 align-top">
                {spot.description}
              </td>
              <td className="p-2.5 border-b border-gray-100 align-top">
                <div className="inline-block bg-blue-50 text-blue-800 text-xs px-1.5 py-0.5 rounded mb-1">
                  Name: {spot.name || "-"}
                </div>
                <br />
                <div className="inline-block bg-blue-50 text-blue-800 text-xs px-1.5 py-0.5 rounded">
                  Kontakt: {spot.contact || "-"}
                </div>
              </td>
              <td className="p-2.5 border-b border-gray-100 align-top">
                <button
                  onClick={() => handleDelete(spot.id)}
                  title="Löschen (Admin)"
                  className="
                    bg-red-50 border border-red-200 text-red-500
                    w-8 h-8 rounded inline-flex items-center justify-center
                    cursor-pointer hover:bg-red-500 hover:text-white
                  "
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-5 text-right">
        <button
          onClick={emailAllSpots}
          className="inline-block bg-gray-600 text-white px-4 py-2.5 rounded-md font-bold cursor-pointer hover:bg-gray-700"
        >
          📧 Alle Spots kontaktieren
        </button>
      </div>
    </div>
  );
}
