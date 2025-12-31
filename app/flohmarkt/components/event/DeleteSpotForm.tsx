"use client";

import { useState, useEffect } from "react";
import { useFlohmarkt } from "../../FlohmarktContext";
import { normalizeAddress } from "../../lib/addressNormalization";

export function DeleteSpotForm() {
  const { deleteSpotByVerification, setCurrentTab, deletePreFill, setDeletePreFill } =
    useFlohmarkt();
  const [street, setStreet] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [zip, setZip] = useState("");
  const [city, setCity] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [reason, setReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (deletePreFill) {
      // Pre-fill assumes format: "Street HouseNumber, ZIP City"
      // Try to parse it, otherwise just put it in street field
      const match = deletePreFill.match(/^(.+?)\s+(\d+\w*),?\s*(\d{5})?\s*(.*)$/);
      if (match) {
        setStreet(match[1] || "");
        setHouseNumber(match[2] || "");
        setZip(match[3] || "");
        setCity(match[4] || "");
      } else {
        setStreet(deletePreFill);
      }
      setDeletePreFill("");
    }
  }, [deletePreFill, setDeletePreFill]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Normalize and reconstruct address_raw (matching registration format)
    const normalized = normalizeAddress(street, houseNumber, zip, city);
    const addressRaw = [normalized.street, normalized.houseNumber, normalized.zip, normalized.city].filter(Boolean).join(" ");

    const result = await deleteSpotByVerification(addressRaw, contactName, contactEmail, reason);

    setIsProcessing(false);

    if (result.success) {
      // Clear form
      setStreet("");
      setHouseNumber("");
      setZip("");
      setCity("");
      setContactName("");
      setContactEmail("");
      setReason("");

      // Show success modal
      setShowSuccessModal(true);

      // Auto-redirect after 3 seconds
      setTimeout(() => {
        setShowSuccessModal(false);
        setCurrentTab("list");
      }, 3000);
    } else {
      alert(result.error || "Fehler: Es wurde kein Spot mit diesen exakten Daten gefunden.");
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setCurrentTab("list");
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
          <p className="text-sm text-gray-500 mb-4 italic">
            Wenn keine Informationen hinterlegt wurden, lasse das Feld leer.
          </p>

          {/* Address fields - matching registration form structure */}
          <div className="mb-4">
            <label className="block mb-1 font-bold text-gray-700 text-sm">
              Straße *
            </label>
            <input
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-md text-base text-gray-900"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-bold text-gray-700 text-sm">
              Hausnummer
            </label>
            <input
              type="text"
              value={houseNumber}
              onChange={(e) => setHouseNumber(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md text-base text-gray-900"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-bold text-gray-700 text-sm">
              PLZ
            </label>
            <input
              type="text"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md text-base text-gray-900"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-bold text-gray-700 text-sm">
              Stadt *
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-md text-base text-gray-900"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-bold text-gray-700 text-sm">
              Dein Name
            </label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md text-base text-gray-900"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-bold text-gray-700 text-sm">
              E-Mail
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md text-base text-gray-900"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-bold text-gray-700 text-sm">
              Grund für die Löschung (optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="z.B. Ich kann leider doch nicht teilnehmen..."
              className="w-full p-3 border border-gray-300 rounded-md text-base text-gray-900 placeholder:text-gray-400 resize-y"
            />
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-red-500 text-white p-3.5 border-none rounded-md text-lg font-bold cursor-pointer hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? "Wird verarbeitet..." : "Löschanfrage senden"}
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

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              {/* Success Icon */}
              <div className="mb-6">
                <div className="w-24 h-24 bg-[#003366] rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>

              {/* Success Message */}
              <h2 className="text-3xl font-bold text-[#003366] mb-3">
                Löschanfrage erfolgreich gesendet!
              </h2>
              <p className="text-gray-600 mb-8 text-lg">
                Die Organisator:innen wurden benachrichtigt und werden deine Anfrage prüfen.
                Du erhältst eine E-Mail, sobald eine Entscheidung getroffen wurde.
              </p>

              {/* Action Button */}
              <button
                onClick={handleCloseSuccessModal}
                className="w-full bg-[#003366] text-white px-6 py-4 rounded-lg text-lg font-bold hover:bg-[#002244] transition-colors shadow-md"
              >
                Zur Spot-Liste
              </button>

              {/* Auto-close info */}
              <p className="text-sm text-gray-400 mt-4">
                Wird automatisch weitergeleitet...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
