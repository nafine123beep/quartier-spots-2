"use client";

import { useState, useEffect } from "react";
import { useFlohmarkt } from "../../FlohmarktContext";

export function DeleteSpotForm() {
  const { deleteSpotByVerification, setCurrentTab, deletePreFill, setDeletePreFill } =
    useFlohmarkt();
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");

  useEffect(() => {
    if (deletePreFill) {
      setAddress(deletePreFill);
      setDeletePreFill("");
    }
  }, [deletePreFill, setDeletePreFill]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const success = deleteSpotByVerification(address, name, contact);

    if (success) {
      alert("Spot erfolgreich gelöscht.");
      setCurrentTab("list");
      setAddress("");
      setName("");
      setContact("");
    } else {
      alert("Fehler: Es wurde kein Spot mit diesen exakten Daten gefunden.");
    }
  };

  return (
    <div className="h-full overflow-y-auto p-5">
      <div className="max-w-[600px] mx-auto bg-white p-5 rounded-lg border border-red-500">
        <h3 className="mt-0 text-red-500">Spot löschen</h3>
        <p className="text-gray-600">
          Bitte gib deine Daten ein, um deinen Spot zu verifizieren und zu
          löschen.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1 font-bold text-gray-600 text-sm">
              Adresse (exakt wie beim Eintrag)
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-md text-base"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-bold text-gray-600 text-sm">
              Dein Name (wie beim Eintrag)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md text-base"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-bold text-gray-600 text-sm">
              Kontakt (wie beim Eintrag)
            </label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md text-base"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-500 text-white p-3.5 border-none rounded-md text-lg font-bold cursor-pointer hover:bg-red-600"
          >
            Endgültig löschen
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab("list")}
            className="w-full bg-gray-300 text-gray-700 p-3.5 border-none rounded-md text-lg font-bold mt-2.5 cursor-pointer hover:bg-gray-400"
          >
            Abbrechen
          </button>
        </form>
      </div>
    </div>
  );
}
