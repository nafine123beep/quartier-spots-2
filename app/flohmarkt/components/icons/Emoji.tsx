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

// Emoji constants for consistent usage across the app
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
