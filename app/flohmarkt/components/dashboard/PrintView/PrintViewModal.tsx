"use client";

import { useState, useRef, useMemo } from 'react';
import { useFlohmarkt } from '../../../FlohmarktContext';
import { PrintPreviewMap, PrintPreviewMapRef } from './PrintPreviewMap';
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
  const mapRef = useRef<PrintPreviewMapRef>(null);
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

  // Count spots with valid coordinates
  const spotsWithCoords = useMemo(
    () => sortedSpots.filter(s => s.lat != null && s.lng != null).length,
    [sortedSpots]
  );

  if (!isOpen || !currentTenantEvent) return null;

  const initialCenter: [number, number] = [
    currentTenantEvent.map_center_lat ?? 49.42,
    currentTenantEvent.map_center_lng ?? 11.06,
  ];

  const handleGeneratePDF = async () => {
    if (!mapRef.current) {
      setErrorMessage('Karte nicht bereit. Bitte versuchen Sie es erneut.');
      return;
    }

    try {
      setState('capturing');
      setErrorMessage(null);

      // Capture map as image
      const mapImageDataUrl = await mapRef.current.captureAsImage();

      setState('generating');

      // Generate PDF
      const pdfBlob = await generateEventPDF({
        event: currentTenantEvent,
        spots: sortedSpots,
        highlights,
        customHighlightTypes,
        mapImageDataUrl,
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
    if (state === 'capturing' || state === 'generating') {
      // Don't allow closing during generation
      return;
    }
    setState('idle');
    setErrorMessage(null);
    onClose();
  };

  const isProcessing = state === 'capturing' || state === 'generating';

  return (
    <div className="fixed inset-0 bg-black/90 z-[4000] flex flex-col">
      {/* Header */}
      <div className="bg-[#003366] text-white px-4 py-3 flex items-center justify-between shrink-0">
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

      {/* Instructions */}
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-3 shrink-0">
        <div className="max-w-4xl mx-auto">
          <p className="m-0 text-sm text-blue-900">
            <span className="font-bold">Schritt 1:</span> Verschieben und zoomen Sie die Karte, um den gewünschten Ausschnitt zu wählen.
          </p>
          <p className="m-0 mt-1 text-sm text-blue-900">
            <span className="font-bold">Schritt 2:</span> Klicken Sie auf &quot;PDF erstellen&quot;, um das Dokument zu generieren und herunterzuladen.
          </p>
        </div>
      </div>

      {/* Map Preview */}
      <div className="flex-1 relative overflow-hidden">
        <PrintPreviewMap
          ref={mapRef}
          spots={regularSpots}
          highlights={highlights}
          customHighlightTypes={customHighlightTypes}
          initialCenter={initialCenter}
          initialZoom={14}
          boundaryRadius={currentTenantEvent.boundary_radius_meters}
        />

        {/* Stats overlay */}
        <div className="absolute top-3 right-3 bg-white rounded-lg shadow-lg px-4 py-3 text-sm">
          <p className="m-0 font-bold text-[#003366] mb-2">PDF-Inhalt:</p>
          <ul className="m-0 p-0 list-none space-y-1">
            <li className="text-gray-700 flex items-center gap-2">
              <span className="w-5 h-5 bg-[#003366] rounded-full flex items-center justify-center text-white text-xs font-bold">
                {sortedSpots.length > 9 ? '#' : sortedSpots.length || '0'}
              </span>
              <span>
                {sortedSpots.length} {sortedSpots.length === 1 ? terms.singular : terms.plural}
                {sortedSpots.length > 0 && spotsWithCoords < sortedSpots.length && (
                  <span className="text-orange-600 text-xs ml-1">
                    ({spotsWithCoords} auf Karte)
                  </span>
                )}
              </span>
            </li>
            {highlights.length > 0 && (
              <li className="text-gray-700 flex items-center gap-2">
                <span className="w-5 h-5 bg-[#FFC107] rounded-full flex items-center justify-center text-sm">
                  {highlights[0]?.highlight_icon || '📍'}
                </span>
                <span>{highlights.length} Highlight{highlights.length !== 1 ? 's' : ''}</span>
              </li>
            )}
          </ul>
        </div>

        {/* Processing overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#003366] border-t-transparent mx-auto mb-4"></div>
              <p className="text-lg font-bold text-[#003366]">
                {state === 'capturing' && 'Karte wird erfasst...'}
                {state === 'generating' && 'PDF wird erstellt...'}
              </p>
              <p className="text-sm text-gray-600">Bitte warten Sie einen Moment.</p>
            </div>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="bg-gray-900 px-4 py-4 shrink-0">
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
        <div className="flex gap-3 justify-center">
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={handleGeneratePDF}
            disabled={isProcessing}
            className="px-8 py-3 bg-[#FFCC00] text-[#003366] rounded-lg hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-colors flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Bitte warten...</span>
              </>
            ) : (
              <>
                <span>📄</span>
                <span>PDF erstellen</span>
              </>
            )}
          </button>
        </div>

        {/* Hint */}
        {!isProcessing && state !== 'complete' && (
          <p className="text-center text-gray-400 text-sm mt-3 m-0">
            Das PDF enthält die Spot-Liste mit Kontaktdaten, Highlights und die Kartenansicht.
          </p>
        )}
      </div>
    </div>
  );
}
