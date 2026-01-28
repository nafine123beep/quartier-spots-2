"use client";

import { useState } from 'react';
import { useFlohmarkt } from '../../FlohmarktContext';
import { Spot } from '../../types';
import { getHighlightIcon, getHighlightTypeLabel } from '../../lib/highlightConfig';

interface HighlightTableProps {
  highlights: Spot[];
  onEdit: (highlight: Spot) => void;
}

export function HighlightTable({ highlights, onEdit }: HighlightTableProps) {
  const { deleteHighlight, customHighlightTypes } = useFlohmarkt();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (highlight: Spot) => {
    if (!confirm(`Möchtest du das Highlight "${highlight.title || getHighlightTypeLabel(highlight.highlight_type || '', customHighlightTypes)}" wirklich löschen?`)) {
      return;
    }

    setDeletingId(highlight.id);
    const success = await deleteHighlight(highlight.id);

    if (!success) {
      alert('Fehler beim Löschen des Highlights');
    }
    setDeletingId(null);
  };

  const formatLocation = (highlight: Spot) => {
    if (highlight.address_raw) {
      return highlight.address_raw;
    }
    if (highlight.lat && highlight.lng) {
      return `${highlight.lat.toFixed(6)}, ${highlight.lng.toFixed(6)}`;
    }
    return '-';
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Typ
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Titel
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Beschreibung
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Standort
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-60">
              Aktionen
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {highlights.map((highlight) => {
            const icon = getHighlightIcon(highlight.highlight_type || '', customHighlightTypes);
            const label = getHighlightTypeLabel(highlight.highlight_type || '', customHighlightTypes);

            return (
              <tr key={highlight.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{icon}</span>
                    <span className="text-sm font-medium text-gray-900">{label}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {highlight.title || '-'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-700 max-w-xs truncate">
                    {highlight.public_note || '-'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-700 max-w-xs truncate">
                    {formatLocation(highlight)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(highlight)}
                      title="Bearbeiten"
                      className="bg-blue-50 border border-blue-200 text-blue-600 w-8 h-8 rounded inline-flex items-center justify-center hover:bg-blue-100 disabled:opacity-50 transition-colors"
                      disabled={deletingId === highlight.id}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(highlight)}
                      title="Löschen"
                      className="bg-red-50 border border-red-200 text-red-600 w-8 h-8 rounded inline-flex items-center justify-center hover:bg-red-100 disabled:opacity-50 transition-colors"
                      disabled={deletingId === highlight.id}
                    >
                      {deletingId === highlight.id ? '...' : '🗑️'}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
