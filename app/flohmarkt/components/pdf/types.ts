import { Spot, TenantEvent, CustomHighlightType } from '../../types';

/**
 * Input data for PDF generation
 */
export interface PDFGeneratorInput {
  event: TenantEvent;
  spots: Spot[];
  highlights: Spot[];
  customHighlightTypes: CustomHighlightType[];
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
 * State for PDF generation process
 */
export type PDFGenerationState = 'idle' | 'capturing' | 'generating' | 'complete' | 'error';

/**
 * Input data for promotional poster PDF generation (A4 format)
 */
export interface PosterPDFInput {
  event: TenantEvent;
  organizationSlug: string;
  coverImageUrl?: string;
  registrationUrl: string;
  contactEmail?: string;
  customDescription?: string; // User-edited description for this poster (overrides event.description)
}

/**
 * Input data for flyer PDF generation (A6 format)
 */
export interface FlyerPDFInput {
  event: TenantEvent;
  coverImageUrl?: string;
  registrationUrl: string;
  contactEmail?: string;
  customDescription?: string; // User-edited description for this flyer (overrides event.description)
}

/**
 * Print format type (A4 poster or A6 flyer)
 */
export type PrintFormat = 'a4' | 'a6';
