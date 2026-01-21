# Icon Library

A centralized icon system for the Quartier Spots application.

## Usage

### SVG Icons

Import and use SVG icon components directly:

```tsx
import { SuccessIcon, LocationIcon, CloseIcon } from '@/app/flohmarkt/components/icons';

// Basic usage
<SuccessIcon />

// With custom props
<SuccessIcon
  size={20}
  color="#003366"
  strokeWidth={3}
  className="mr-2"
  aria-label="Operation successful"
/>
```

### Available SVG Icons

- `SuccessIcon` - Checkmark icon for success states
- `ImageIcon` - Picture/image placeholder icon
- `CropIcon` - Image cropping/editing icon
- `StarIcon` - Star/favorite icon
- `CloseIcon` - X/close icon
- `LocationIcon` - Map pin/location icon
- `ArrowIcon` - Directional arrow (supports `direction` prop: 'up', 'down', 'left', 'right')
- `UploadIcon` - Cloud upload icon

### Icon Props

All SVG icons support these props:

```typescript
interface IconProps {
  className?: string;        // Additional CSS classes
  size?: number | string;    // Icon size (default: 24)
  color?: string;            // Stroke color (default: 'currentColor')
  strokeWidth?: number;      // Stroke width (default: 2)
  'aria-label'?: string;     // Accessibility label
}
```

### Emoji Icons

Use the `Emoji` component for consistent emoji rendering:

```tsx
import { Emoji, EMOJIS } from '@/app/flohmarkt/components/icons';

// Using emoji constants
<Emoji symbol={EMOJIS.DELETE} label="Delete" />
<Emoji symbol={EMOJIS.MAP} size="lg" />

// Custom emoji
<Emoji symbol="🎉" label="Celebration" />
```

### Available Emoji Constants

```typescript
EMOJIS = {
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
}
```

## Design Guidelines

### Colors

Use these primary colors with icons:

- Primary: `#003366` (dark blue)
- Secondary: `#FFCC00` (yellow)
- Error/Delete: Red variants
- Success: Green variants

### Sizes

Common size classes for consistency:

- `w-3 h-3` (12px) - Extra small
- `w-4 h-4` (16px) - Small
- `w-5 h-5` (20px) - Medium
- `w-6 h-6` (24px) - Large
- `w-8 h-8` (32px) - Extra large

### Accessibility

Always provide meaningful `aria-label` attributes for screen readers:

```tsx
<CloseIcon aria-label="Close dialog" />
<LocationIcon aria-label="Event location" />
```

## Migration Guide

### Before (Inline SVG)

```tsx
<svg
  className="w-5 h-5 text-green-600"
  fill="none"
  stroke="currentColor"
  viewBox="0 0 24 24"
>
  <path d="M5 13l4 4L19 7" strokeWidth={2} />
</svg>
```

### After (Icon Library)

```tsx
import { SuccessIcon } from '@/app/flohmarkt/components/icons';

<SuccessIcon className="w-5 h-5 text-green-600" />
```

### Before (Emoji)

```tsx
<span>🗑️</span>
```

### After (Icon Library)

```tsx
import { Emoji, EMOJIS } from '@/app/flohmarkt/components/icons';

<Emoji symbol={EMOJIS.DELETE} label="Delete" />
```

## Benefits

- Single source of truth for all icons
- Consistent sizing and styling
- Better accessibility with proper ARIA labels
- Reduced code duplication
- Easy to maintain and update
- Type-safe with TypeScript
