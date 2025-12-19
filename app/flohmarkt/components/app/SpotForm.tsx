"use client";

import { useState } from "react";
import { useFlohmarkt } from "../../FlohmarktContext";

export function SpotForm() {
  const { addSpot, setCurrentTab } = useFlohmarkt();
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [description, setDescription] = useState("");
  const [consent, setConsent] = useState(false);

  // Mock geocoding - returns random coordinates near center
  const mockGeocode = () => {
    const centerLat = 49.418;
    const centerLng = 11.058;
    return {
      lat: centerLat + (Math.random() - 0.5) * 0.01,
      lng: centerLng + (Math.random() - 0.5) * 0.01,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const coords = mockGeocode();

    addSpot({
      address,
      description,
      lat: coords.lat,
      lng: coords.lng,
      name,
      contact,
      consent,
    });

    alert("Spot erfolgreich angelegt!");
    setCurrentTab("list");

    // Reset form
    setAddress("");
    setName("");
    setContact("");
    setDescription("");
    setConsent(false);
  };

  return (
    <div className="h-full overflow-y-auto p-5">
      <div className="max-w-[600px] mx-auto bg-white p-5 rounded-lg">
        <h3 className="mt-0 text-[#003366]">Deinen Spot eintragen</h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1 font-bold text-gray-700 text-sm">
              Adresse
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Straße, Hausnummer, Stadt"
              required
              className="w-full p-3 border border-gray-300 rounded-md text-base text-gray-900 placeholder:text-gray-400"
            />
          </div>

          <div className="flex items-start gap-2.5 mb-5">
            <input
              type="checkbox"
              id="consent"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              required
              className="w-5 h-5 mt-0.5 shrink-0"
            />
            <label htmlFor="consent" className="text-sm text-gray-700 leading-snug">
              Ich bin damit einverstanden, dass meine Adresse öffentlich auf der
              Karte angezeigt wird.
            </label>
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-bold text-gray-700 text-sm">
              Dein Name (Optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="w-full p-3 border border-gray-300 rounded-md text-base text-gray-900 placeholder:text-gray-400"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-bold text-gray-700 text-sm">
              Kontakt (Email/Telefon) (Optional)
            </label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Email oder Telefonnummer"
              className="w-full p-3 border border-gray-300 rounded-md text-base text-gray-900 placeholder:text-gray-400"
            />
          </div>

          <div className="text-xs text-gray-600 -mt-2.5 mb-5 bg-gray-50 p-2.5 rounded leading-snug">
            Hinweis: Name und E-Mail-Adresse werden nicht öffentlich angezeigt.
            Daten dienen lediglich der Kontaktaufnahme seitens der
            Veranstalter:innen.
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-bold text-gray-700 text-sm">
              Was verkaufst du?
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="z.B. Kindersachen, Bücher..."
              required
              className="w-full p-3 border border-gray-300 rounded-md text-base text-gray-900 placeholder:text-gray-400 resize-y"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#003366] text-white p-3.5 border-none rounded-md text-lg font-bold cursor-pointer hover:bg-[#002244]"
          >
            Absenden
          </button>
        </form>
      </div>
    </div>
  );
}
