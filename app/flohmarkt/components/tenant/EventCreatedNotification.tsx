"use client";

interface EventCreatedNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
  eventSlug: string;
  tenantSlug: string;
}

export function EventCreatedNotification({
  isOpen,
  onClose,
  eventId,
  eventTitle,
  eventSlug,
  tenantSlug,
}: EventCreatedNotificationProps) {
  if (!isOpen) return null;

  const handleGoToEvent = () => {
    // Navigate to the event page directly (event is already active)
    window.location.href = `/flohmarkt/${tenantSlug}/${eventSlug}`;
  };

  const handleGoToDashboard = () => {
    // Navigate to the event dashboard
    window.location.href = `/flohmarkt/organizations/${tenantSlug}/events/${eventSlug}`;
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#003366] text-white p-5 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold m-0">Event erstellt!</h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              aria-label="Schließen"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Event Title */}
          <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">
            &quot;{eventTitle}&quot;
          </h3>

          {/* Main Message */}
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-bold text-gray-800 mb-2">
                  Dein Event ist jetzt aktiv!
                </p>
                <p className="text-sm text-gray-700 mb-0">
                  Teilnehmer können sich ab sofort anmelden. Du kannst jetzt Druckmaterialien erstellen oder Links teilen.
                </p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mb-4">
            <p className="text-sm font-bold text-gray-700 mb-2">Nächste Schritte:</p>
            <ul className="text-sm text-gray-700 space-y-1 pl-5 list-disc">
              <li>Erstelle Poster und Flyer mit QR-Code</li>
              <li>Teile den Link in sozialen Medien</li>
              <li>Füge optional weitere Fotos hinzu</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleGoToEvent}
              className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-md font-bold hover:bg-gray-300 transition-colors"
            >
              Event ansehen
            </button>
            <button
              onClick={handleGoToDashboard}
              className="flex-1 bg-[#003366] text-white px-4 py-3 rounded-md font-bold hover:bg-[#002244] transition-colors"
            >
              Zum Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
