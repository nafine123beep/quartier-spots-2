"use client";

import { useState } from "react";
import { useFlohmarkt } from "../../FlohmarktContext";

export function PendingDeletionRequests() {
  const { deletionRequests, pendingDeletionCount, approveDeletionRequest, rejectDeletionRequest } = useFlohmarkt();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reviewerNote, setReviewerNote] = useState("");

  const pendingRequests = deletionRequests.filter(r => r.status === 'pending');

  const handleApprove = async (requestId: string, spotAddress: string) => {
    if (!confirm(
      `Löschanfrage genehmigen?\n\n` +
      `Adresse: ${spotAddress}\n\n` +
      `Der Spot wird ENDGÜLTIG gelöscht und kann nicht wiederhergestellt werden.`
    )) {
      return;
    }

    setProcessingId(requestId);
    const result = await approveDeletionRequest(requestId);
    setProcessingId(null);

    if (result.success) {
      // Success - the component will re-render automatically as deletionRequests updates
    } else {
      alert(`Fehler beim Genehmigen: ${result.error}`);
    }
  };

  const handleRejectClick = (requestId: string) => {
    setRejectingId(requestId);
    setReviewerNote("");
  };

  const handleRejectSubmit = async (requestId: string) => {
    if (!reviewerNote.trim()) {
      alert("Bitte gib eine Begründung für die Ablehnung ein.");
      return;
    }

    setProcessingId(requestId);
    const result = await rejectDeletionRequest(requestId, reviewerNote);
    setProcessingId(null);
    setRejectingId(null);
    setReviewerNote("");

    if (result.success) {
      // Success - the component will re-render automatically
    } else {
      alert(`Fehler beim Ablehnen: ${result.error}`);
    }
  };

  const handleRejectCancel = () => {
    setRejectingId(null);
    setReviewerNote("");
  };

  if (pendingDeletionCount === 0) {
    return null; // Don't show the section if there are no pending requests
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          Löschanfragen
        </h2>
        <span className="bg-red-500 text-white text-sm font-bold rounded-full px-3 py-1">
          {pendingDeletionCount}
        </span>
      </div>

      <p className="text-gray-600 mb-6">
        Folgende Spots haben eine Löschanfrage von Besucher:innen erhalten und warten auf deine Freigabe.
      </p>

      <div className="space-y-4">
        {pendingRequests.map((request) => (
          <div key={request.id} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Left column - Spot info */}
              <div>
                <h3 className="font-bold text-gray-800 mb-2">Spot-Informationen</h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <div>
                    <span className="font-semibold">Adresse:</span>{" "}
                    {request.requester_address || "Keine Adresse angegeben"}
                  </div>
                  {request.requester_name && (
                    <div>
                      <span className="font-semibold">Name:</span> {request.requester_name}
                    </div>
                  )}
                  {request.requester_email && (
                    <div>
                      <span className="font-semibold">E-Mail:</span> {request.requester_email}
                    </div>
                  )}
                </div>
              </div>

              {/* Right column - Request info */}
              <div>
                <h3 className="font-bold text-gray-800 mb-2">Anfrage-Details</h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <div>
                    <span className="font-semibold">Eingereicht am:</span>{" "}
                    {new Date(request.created_at).toLocaleString("de-DE", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  {request.requester_reason && (
                    <div>
                      <span className="font-semibold">Begründung:</span>
                      <div className="mt-1 p-2 bg-white rounded border border-gray-200">
                        {request.requester_reason}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            {rejectingId === request.id ? (
              // Rejection form
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-bold text-gray-800 mb-2">Ablehnung begründen</h4>
                <textarea
                  value={reviewerNote}
                  onChange={(e) => setReviewerNote(e.target.value)}
                  rows={3}
                  placeholder="Bitte gib eine Begründung für die Ablehnung ein (wird per E-Mail an den/die Antragsteller:in gesendet)..."
                  className="w-full p-3 border border-gray-300 rounded-md text-sm text-gray-900 placeholder:text-gray-400 resize-y mb-3"
                  disabled={processingId === request.id}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRejectSubmit(request.id)}
                    disabled={processingId === request.id || !reviewerNote.trim()}
                    className="bg-red-600 text-white px-4 py-2 rounded-md font-bold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingId === request.id ? "Wird abgelehnt..." : "Ablehnung bestätigen"}
                  </button>
                  <button
                    onClick={handleRejectCancel}
                    disabled={processingId === request.id}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md font-bold hover:bg-gray-400 disabled:opacity-50"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            ) : (
              // Action buttons
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-300">
                <button
                  onClick={() => handleApprove(request.id, request.requester_address || "Unbekannte Adresse")}
                  disabled={processingId === request.id}
                  className="bg-green-600 text-white px-4 py-2 rounded-md font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  {processingId === request.id ? "Wird genehmigt..." : "Genehmigen & Löschen"}
                </button>
                <button
                  onClick={() => handleRejectClick(request.id)}
                  disabled={processingId === request.id}
                  className="bg-red-600 text-white px-4 py-2 rounded-md font-bold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  Ablehnen
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
