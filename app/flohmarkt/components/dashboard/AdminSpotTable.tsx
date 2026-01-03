"use client";

import { useFlohmarkt } from "../../FlohmarktContext";
import { getSpotTerms } from "../../lib/spotTerms";

export function AdminSpotTable() {
  const { spots, deleteSpot, getAllEmails, currentTenantEvent } = useFlohmarkt();
  const terms = getSpotTerms(currentTenantEvent?.spot_term_singular, currentTenantEvent?.spot_term_plural);

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
      <h3 className="mt-0 border-b border-gray-200 pb-2.5 text-[#003366] font-bold">
        {terms.managementRegisteredSpots}
      </h3>

      {spots.length === 0 ? (
        <p className="text-gray-600 py-4">{terms.noSpotsRegistered}</p>
      ) : (
        <table className="w-full border-collapse min-w-[600px]">
          <thead>
            <tr>
              <th className="text-left bg-gray-100 p-2.5 border-b-2 border-gray-300 text-[#003366] font-bold">
                {terms.addressSlashSpot}
              </th>
              <th className="text-left bg-gray-100 p-2.5 border-b-2 border-gray-300 text-[#003366] font-bold">
                Beschreibung
              </th>
              <th className="text-left bg-gray-100 p-2.5 border-b-2 border-gray-300 text-[#003366] font-bold">
                Interne Daten (Privat)
              </th>
              <th className="text-left bg-gray-100 p-2.5 border-b-2 border-gray-300 text-[#003366] font-bold">
                Aktion
              </th>
            </tr>
          </thead>
          <tbody>
            {spots.map((spot) => (
              <tr key={spot.id} className="hover:bg-gray-50">
                <td className="p-2.5 border-b border-gray-100 align-top text-gray-900">
                  <strong>{spot.address_raw || "-"}</strong>
                </td>
                <td className="p-2.5 border-b border-gray-100 align-top text-gray-900">
                  {spot.public_note || "-"}
                </td>
                <td className="p-2.5 border-b border-gray-100 align-top">
                  <div className="inline-block bg-blue-100 text-blue-900 text-xs px-1.5 py-0.5 rounded mb-1 font-medium">
                    Name: {spot.contact_name || "-"}
                  </div>
                  <br />
                  <div className="inline-block bg-blue-100 text-blue-900 text-xs px-1.5 py-0.5 rounded mb-1 font-medium">
                    E-Mail: {spot.contact_email || "-"}
                  </div>
                  <br />
                  <div className="inline-block bg-blue-100 text-blue-900 text-xs px-1.5 py-0.5 rounded font-medium">
                    Telefon: {spot.contact_phone || "-"}
                  </div>
                </td>
                <td className="p-2.5 border-b border-gray-100 align-top">
                  <button
                    onClick={() => handleDelete(spot.id)}
                    title="Löschen (Admin)"
                    className="
                      bg-red-50 border border-red-200 text-red-600
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
      )}

      <div className="mt-5 text-right">
        <button
          onClick={emailAllSpots}
          className="inline-block bg-[#003366] text-white px-4 py-2.5 rounded-md font-bold cursor-pointer hover:bg-[#002244]"
        >
          📧 {terms.contactAllSpots}
        </button>
      </div>
    </div>
  );
}
