"use client";

interface AddressCacheIndicatorProps {
  onClear: () => void;
  onDismiss: () => void;
}

export function AddressCacheIndicator({
  onClear,
  onDismiss,
}: AddressCacheIndicatorProps) {
  return (
    <div className="mb-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg shadow-sm">
      <div className="flex items-start gap-3 p-4">
        <div className="flex-shrink-0 text-2xl">📍</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 mb-1">
            Adresse wurde automatisch ausgefüllt
          </p>
          <p className="text-xs text-gray-600">
            Die Felder wurden mit deiner gespeicherten Adresse ausgefüllt. Du
            kannst sie jederzeit ändern.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={onClear}
              className="text-xs px-3 py-1.5 bg-white border border-blue-300 text-blue-700 rounded-md hover:bg-blue-50 transition-colors font-medium"
            >
              Andere Adresse verwenden
            </button>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 text-xl font-bold w-6 h-6 flex items-center justify-center rounded transition-colors"
          aria-label="Hinweis ausblenden"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
