"use client";

import { useState } from 'react';
import { useFlohmarkt } from '../../FlohmarktContext';
import { HighlightTable } from './HighlightTable';
import { HighlightFormModal } from './HighlightFormModal';
import { CustomTypeManager } from './CustomTypeManager';
import { Spot } from '../../types';

export function HighlightManagementPanel() {
  const { spots, isAdmin } = useFlohmarkt();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHighlight, setEditingHighlight] = useState<Spot | null>(null);
  const [showCustomTypes, setShowCustomTypes] = useState(false);

  if (!isAdmin) {
    return (
      <div className="p-8 text-center text-gray-700">
        <p className="text-lg">Du benötigst Admin-Rechte, um Highlights zu verwalten.</p>
      </div>
    );
  }

  const highlights = spots.filter(s => s.is_highlight);

  const handleAddClick = () => {
    setEditingHighlight(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (highlight: Spot) => {
    setEditingHighlight(highlight);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingHighlight(null);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Event Highlights</h2>
          <p className="text-sm text-gray-600 mt-1">
            Verwalte wichtige Infrastrukturpunkte wie Registrierung, Toiletten, Info-Points, etc.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCustomTypes(true)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Typen verwalten
          </button>
          <button
            onClick={handleAddClick}
            className="px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#002244] transition-colors font-medium flex items-center gap-2"
          >
            <span>➕</span> Highlight hinzufügen
          </button>
        </div>
      </div>

      {highlights.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <div className="text-4xl mb-4">📍</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Noch keine Highlights vorhanden
          </h3>
          <p className="text-gray-700 mb-6 max-w-md mx-auto">
            Füge wichtige Punkte wie Registrierung, Toiletten oder Info-Stands hinzu,
            damit Teilnehmer:innen sich besser orientieren können.
          </p>
          <button
            onClick={handleAddClick}
            className="px-6 py-3 bg-[#003366] text-white rounded-lg hover:bg-[#002244] transition-colors font-medium"
          >
            Erstes Highlight erstellen
          </button>
        </div>
      ) : (
        <HighlightTable
          highlights={highlights}
          onEdit={handleEditClick}
        />
      )}

      {isFormOpen && (
        <HighlightFormModal
          highlight={editingHighlight}
          onClose={handleCloseForm}
        />
      )}

      {showCustomTypes && (
        <CustomTypeManager onClose={() => setShowCustomTypes(false)} />
      )}
    </div>
  );
}
