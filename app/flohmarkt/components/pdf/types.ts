import { Spot, TenantEvent, CustomHighlightType } from '../../types';

/**
 * Input data for PDF generation
 */
export interface PDFGeneratorInput {
  event: TenantEvent;
  spots: Spot[];
  highlights: Spot[];
  customHighlightTypes: CustomHighlightType[];
  mapImageDataUrl: string;
}

/**
 * Processed spot entry for PDF rendering
 */
export interface PDFSpotEntry {
  number: number;
  address: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  publicNote: string;
  internalNote: string;
  hasCoordinates: boolean;
}

/**
 * Processed highlight entry for PDF rendering
 */
export interface PDFHighlightEntry {
  icon: string;
  label: string;
  address: string;
  note: string;
}

/**
 * Map viewport bounds
 */
export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

/**
 * State for PDF generation process
 */
export type PDFGenerationState = 'idle' | 'capturing' | 'generating' | 'complete' | 'error';

/**
 * Input data for promotional poster PDF generation
 */
export interface PosterPDFInput {
  event: TenantEvent;
  organizationSlug: string;
  coverImageUrl?: string;
  registrationUrl: string;
  contactEmail?: string;
  customDescription?: string; // User-edited description for this poster (overrides event.description)
}
