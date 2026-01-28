"use client";

import { useState } from 'react';
import { useFlohmarkt } from '../../FlohmarktContext';
import { AVAILABLE_HIGHLIGHT_ICONS } from '../../lib/highlightConfig';

interface CustomTypeManagerProps {
  onClose: () => void;
}

/**
 * Generate a unique type_key from a label
 * Converts to lowercase, replaces spaces/special chars with underscores
 */
function generateTypeKey(label: string, existingKeys: string[]): string {
  // Convert to lowercase, replace spaces and special chars with underscores
  let baseKey = label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '_')     // Replace non-alphanumeric with underscore
    .replace(/^_+|_+$/g, '')         // Trim leading/trailing underscores
    .replace(/_+/g, '_');            // Collapse multiple underscores

  // Ensure it starts with a letter
  if (!/^[a-z]/.test(baseKey)) {
    baseKey = 'type_' + baseKey;
  }

  // Ensure uniqueness by appending a number if needed
  let key = baseKey;
  let counter = 1;
  while (existingKeys.includes(key)) {
    key = `${baseKey}_${counter}`;
    counter++;
  }

  return key;
}

export function CustomTypeManager({ onClose }: CustomTypeManagerProps) {
  const { customHighlightTypes, addCustomHighlightType, deleteCustomHighlightType } = useFlohmarkt();
  const [label, setLabel] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(AVAILABLE_HIGHLIGHT_ICONS[5]); // Default to 📍
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!label || !selectedIcon) {
      alert('Bitte fülle alle Felder aus');
      return;
    }

    // Auto-generate type_key from label
    const existingKeys = customHighlightTypes.map(t => t.type_key);
    const typeKey = generateTypeKey(label, existingKeys);

    setIsSubmitting(true);
    const success = await addCustomHighlightType(typeKey, label, selectedIcon);

    if (success) {
      setLabel('');
      setSelectedIcon(AVAILABLE_HIGHLIGHT_ICONS[5]);
    } else {
      alert('Fehler beim Erstellen des Typs');
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Möchtest du diesen benutzerdefinierten Typ wirklich löschen?')) {
      return;
    }

    setDeletingId(id);
    const success = await deleteCustomHighlightType(id);

    if (!success) {
      alert('Fehler beim Löschen des Typs. Stelle sicher, dass keine Highlights diesen Typ verwenden.');
    }
    setDeletingId(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Benutzerdefinierte Highlights</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Existing Custom Types */}
          {customHighlightTypes.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Vorhandene benutzerdefinierte Typen
              </h3>
              <div className="space-y-2">
                {customHighlightTypes.map((type) => (
                  <div
                    key={type.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{type.icon}</span>
                      <span className="font-medium text-gray-900">{type.label}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(type.id)}
                      title="Löschen"
                      className="bg-red-50 border border-red-200 text-red-600 w-8 h-8 rounded inline-flex items-center justify-center hover:bg-red-100 disabled:opacity-50 transition-colors"
                      disabled={deletingId === type.id}
                    >
                      {deletingId === type.id ? '...' : '🗑️'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Custom Type Form */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Neuen Typ hinzufügen
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Anzeigename *
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                  placeholder="z.B. Erste-Hilfe-Station"
                  required
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Icon auswählen *
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {AVAILABLE_HIGHLIGHT_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setSelectedIcon(icon)}
                      className={`
                        p-3 text-2xl rounded-lg border-2 transition-all
                        ${selectedIcon === icon
                          ? 'border-[#003366] bg-blue-50'
                          : 'border-gray-200 hover:border-gray-400'
                        }
                      `}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !label}
                  className="flex-1 px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#002244] transition-colors font-medium disabled:opacity-50"
                >
                  {isSubmitting ? 'Wird erstellt...' : 'Typ hinzufügen'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Schließen
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
