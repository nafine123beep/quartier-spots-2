"use client";

import { useState, useMemo } from 'react';
import { useFlohmarkt } from '../../../FlohmarktContext';
import { generateEventPDF, downloadPDF } from '../../pdf/PDFGenerator';
import { sortSpotsForPrint, generatePDFFilename } from '../../../lib/printUtils';
import { getSpotTerms } from '../../../lib/spotTerms';
import { PDFGenerationState } from '../../pdf/types';

interface PrintViewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrintViewModal({ isOpen, onClose }: PrintViewModalProps) {
  const { currentTenantEvent, spots, customHighlightTypes } = useFlohmarkt();
  const [state, setState] = useState<PDFGenerationState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const terms = getSpotTerms(
    currentTenantEvent?.spot_term_singular,
    currentTenantEvent?.spot_term_plural
  );

  // Separate regular spots from highlights
  const regularSpots = useMemo(() => spots.filter(s => !s.is_highlight), [spots]);
  const highlights = useMemo(() => spots.filter(s => s.is_highlight), [spots]);
  const sortedSpots = useMemo(() => sortSpotsForPrint(regularSpots), [regularSpots]);

  if (!isOpen || !currentTenantEvent) return null;

  const handleGeneratePDF = async () => {
    try {
      setState('generating');
      setErrorMessage(null);

      // Generate PDF
      const pdfBlob = await generateEventPDF({
        event: currentTenantEvent,
        spots: sortedSpots,
        highlights,
        customHighlightTypes,
      });

      // Download PDF
      const filename = generatePDFFilename(currentTenantEvent);
      downloadPDF(pdfBlob, filename);

      setState('complete');

      // Auto-close after success
      setTimeout(() => {
        onClose();
        setState('idle');
      }, 2000);

    } catch (error) {
      console.error('PDF generation failed:', error);
      setState('error');
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Ein unbekannter Fehler ist aufgetreten.'
      );
    }
  };

  const handleClose = () => {
    if (state === 'generating') {
      // Don't allow closing during generation
      return;
    }
    setState('idle');
    setErrorMessage(null);
    onClose();
  };

  const isProcessing = state === 'generating';

  return (
    <div className="fixed inset-0 bg-black/90 z-[4000] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="bg-[#003366] text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold m-0">PDF erstellen</h3>
            <p className="text-sm text-blue-200 m-0">{currentTenantEvent.title}</p>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-300 text-3xl leading-none p-2 -mr-2"
            disabled={isProcessing}
            title="Schließen"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* PDF Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-6">
            <p className="m-0 font-bold text-[#003366] mb-2">PDF-Inhalt:</p>
            <ul className="m-0 p-0 list-none space-y-2 text-sm">
              <li className="text-gray-700 flex items-center gap-2">
                <span className="w-6 h-6 bg-[#003366] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {sortedSpots.length > 9 ? '#' : sortedSpots.length || '0'}
                </span>
                <span>
                  {sortedSpots.length} {sortedSpots.length === 1 ? terms.singular : terms.plural} mit Kontaktdaten
                </span>
              </li>
              {highlights.length > 0 && (
                <li className="text-gray-700 flex items-center gap-2">
                  <span className="w-6 h-6 bg-[#FFC107] rounded-full flex items-center justify-center text-sm shrink-0">
                    ⭐
                  </span>
                  <span>{highlights.length} Highlight{highlights.length !== 1 ? 's' : ''}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Processing state */}
          {isProcessing && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#003366] border-t-transparent mx-auto mb-4"></div>
              <p className="text-lg font-bold text-[#003366]">
                PDF wird erstellt...
              </p>
              <p className="text-sm text-gray-600">Bitte warten Sie einen Moment.</p>
            </div>
          )}

          {/* Error message */}
          {state === 'error' && errorMessage && (
            <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-start gap-3">
              <span className="text-xl">❌</span>
              <div>
                <p className="font-bold m-0">Fehler bei der PDF-Erstellung</p>
                <p className="m-0 text-sm">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Success message */}
          {state === 'complete' && (
            <div className="bg-green-100 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-3">
              <span className="text-xl">✅</span>
              <p className="font-bold m-0">PDF erfolgreich erstellt und heruntergeladen!</p>
            </div>
          )}

          {/* Buttons */}
          {!isProcessing && (
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleClose}
                className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleGeneratePDF}
                className="px-8 py-2.5 bg-[#FFCC00] text-[#003366] rounded-lg hover:bg-yellow-400 font-bold transition-colors flex items-center gap-2"
              >
                <span>📄</span>
                <span>PDF erstellen</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
