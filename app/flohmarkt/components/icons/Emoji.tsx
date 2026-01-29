/**
 * @deprecated This component is deprecated. Use Lucide icons from '@/app/flohmarkt/components/icons' instead.
 * Example: Replace <Emoji symbol={EMOJIS.DELETE} label="Delete" /> with <Trash2 size={20} aria-label="Delete" />
 * See IconConstants.tsx for icon mappings.
 */
interface EmojiProps {
  symbol: string;
  label?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg'
};

/**
 * @deprecated This component is deprecated. Use Lucide icons instead.
 */
export function Emoji({
  symbol,
  label,
  className = '',
  size = 'md'
}: EmojiProps) {
  return (
    <span
      role="img"
      aria-label={label || symbol}
      className={`${sizeClasses[size]} ${className}`}
    >
      {symbol}
    </span>
  );
}

/**
 * @deprecated These emoji constants are deprecated. Use ICONS from IconConstants.tsx instead.
 * The ICONS object provides Lucide React components with better styling and accessibility.
 *
 * Migration examples:
 * - EMOJIS.DELETE → ICONS.DELETE (Trash2)
 * - EMOJIS.ADD → ICONS.ADD (Plus)
 * - EMOJIS.HOME → ICONS.HOME (Home)
 */
export const EMOJIS = {
  // Actions
  DELETE: '🗑️',
  ADD: '➕',
  EDIT: '📝',
  CHECK: '✓',

  // Navigation
  HOME: '🏠',
  MAP: '🗺️',
  LIST: '📋',
  MENU: '☰',

  // Communication
  EMAIL: '✉️',
  CONTACT: '✉️',

  // Status
  WARNING: '⚠️',
  SUCCESS: '✓',
  DRAFT: '📝',
  PREVIEW: '👁️',

  // Misc
  SETTINGS: '⚙️',
  STAR: '★',
  RATING: '★',
} as const;
