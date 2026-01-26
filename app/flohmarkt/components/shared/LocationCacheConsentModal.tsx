"use client";

interface LocationCacheConsentModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onClose: () => void;
}

export function LocationCacheConsentModal({
  isOpen,
  onAccept,
  onDecline,
  onClose,
}: LocationCacheConsentModalProps) {
  if (!isOpen) return null;

  const handleAccept = () => {
    onAccept();
    onClose();
  };

  const handleDecline = () => {
    onDecline();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4"
      onClick={handleDecline}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#003366] text-white p-5 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold m-0">Adresse speichern?</h2>
            </div>
            <button
              onClick={handleDecline}
              className="text-white/80 hover:text-white text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              aria-label="Schließen"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-4 leading-relaxed">
            Möchtest du diese Adresse speichern? Beim nächsten Spot werden die
            Felder automatisch ausgefüllt, sodass du schneller loslegen kannst.
          </p>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <p className="text-sm text-gray-700 leading-relaxed">
              <span className="font-semibold">Datenschutz:</span> Deine Daten
              werden nur lokal auf diesem Gerät gespeichert und niemals ohne
              deine Zustimmung übertragen.
            </p>
          </div>

          <p className="text-xs text-gray-500 mb-6">
            Du kannst diese Einstellung jederzeit in deinen Profileinstellungen
            ändern.
          </p>

          {/* Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <button
              onClick={handleDecline}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Nein, danke
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 px-4 py-3 bg-[#003366] text-white rounded-lg hover:bg-[#004477] transition-colors font-medium"
            >
              Ja, Adresse speichern
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
