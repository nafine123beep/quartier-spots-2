/**
 * Icon Constants
 *
 * Centralized icon references replacing the old EMOJIS constant.
 * All icons are Lucide React components.
 */

import {
  Trash2,
  Plus,
  Pencil,
  Check,
  Home,
  Map,
  List,
  Menu,
  Mail,
  AlertTriangle,
  CheckCircle,
  Eye,
  Settings,
  Star,
  FileText,
  type LucideIcon,
} from './lucide';

/**
 * Icon constants for consistent usage across the app
 * Usage: <ICONS.DELETE size={20} className="text-red-500" aria-label="Delete" />
 */
export const ICONS = {
  // Actions
  DELETE: Trash2,
  ADD: Plus,
  EDIT: Pencil,
  CHECK: Check,

  // Navigation
  HOME: Home,
  MAP: Map,
  LIST: List,
  MENU: Menu,

  // Communication
  EMAIL: Mail,
  CONTACT: Mail,

  // Status
  WARNING: AlertTriangle,
  SUCCESS: CheckCircle,
  DRAFT: FileText,
  PREVIEW: Eye,

  // Misc
  SETTINGS: Settings,
  STAR: Star,
  RATING: Star,
} as const satisfies Record<string, LucideIcon>;

/**
 * Default icon props for consistent styling
 */
export const DEFAULT_ICON_SIZE = 20;
export const SMALL_ICON_SIZE = 16;
export const LARGE_ICON_SIZE = 24;
export const XLARGE_ICON_SIZE = 32;

/**
 * Icon size mapping (in pixels)
 */
export const ICON_SIZES = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const;
