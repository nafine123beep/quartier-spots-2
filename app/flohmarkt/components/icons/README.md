# Icon System

Centralized icon system for the Quartier Spots application, now powered by **Lucide React** for professional, accessible icons.

## Quick Start

```tsx
import { Trash2, Plus, MapPin, Home } from '@/app/flohmarkt/components/icons';

<Trash2 size={20} aria-label="Delete" />
<Plus size={16} className="text-blue-500" />
<MapPin size={24} color="#003366" />
```

## Icon Library: Lucide React

We use **Lucide React** - a beautiful, consistent icon set with 1,500+ icons.

- **Documentation**: https://lucide.dev/
- **Icon Browser**: https://lucide.dev/icons/
- **Tree-shaking**: Only imported icons included (~1-2KB per icon)
- **Bundle Impact**: ~50-80KB for 40 unique icons

## Usage

### Option 1: Direct Lucide Imports (Recommended)

```tsx
import { Trash2, Plus, MapPin, Loader2 } from '@/app/flohmarkt/components/icons';

<Trash2 size={20} className="text-red-500" aria-label="Delete" />
<Loader2 className="animate-spin" aria-label="Loading" />
```

### Option 2: Icon Constants

Pre-defined constants for common actions:

```tsx
import { ICONS } from '@/app/flohmarkt/components/icons';

<ICONS.DELETE size={20} aria-label="Delete" />
<ICONS.ADD size={16} className="text-blue-500" />
<ICONS.HOME size={24} />
```

**Available Constants:**
- `ICONS.DELETE` (Trash2), `ICONS.ADD` (Plus), `ICONS.EDIT` (Pencil)
- `ICONS.CHECK`, `ICONS.HOME`, `ICONS.MAP`, `ICONS.LIST`
- `ICONS.EMAIL`, `ICONS.WARNING`, `ICONS.SUCCESS`, `ICONS.SETTINGS`, `ICONS.STAR`

## Common Patterns

### Loading Spinner
```tsx
<Loader2 size={20} className="animate-spin" aria-label="Loading..." />
```

### Icon Button
```tsx
<button className="p-2 hover:bg-red-100 rounded-full">
  <Trash2 size={16} className="text-red-500" aria-label="Delete" />
</button>
```

### Icon with Text
```tsx
<div className="flex items-center gap-2">
  <MapPin size={16} />
  <span>Location</span>
</div>
```

## Highlight System Icons

Event highlights use a special resolver system supporting both icon names and emojis:

```tsx
import { resolveIcon, getIconColorClass, iconToSvgString } from '@/app/flohmarkt/lib/iconResolver';

// Get component
const IconComponent = resolveIcon('clipboard-list');
<IconComponent size={24} className="text-blue-500" />

// Get color class
const colorClass = getIconColorClass('circle-red'); // 'text-red-500'

// Convert to SVG string (for Leaflet maps)
const svgString = iconToSvgString('flag', 24);
```

**Base Highlight Icons:**
- `clipboard-list` - Registration, `door-open` - Toilets
- `utensils` - Food, `flag` - Start, `flag-triangle-right` - Finish
- `shield-check` - Awareness, `info` - Info, `circle-parking` - Parking

**Custom Variants:**
- `star`, `sparkles`, `map-pin`
- `circle-red/orange/yellow/green/blue` - Colored circles

## Icon Sizes

### Predefined Sizes (Pixels)
```tsx
import { ICON_SIZES } from '@/app/flohmarkt/components/icons';

ICON_SIZES.xs  // 12px
ICON_SIZES.sm  // 16px
ICON_SIZES.md  // 20px (default)
ICON_SIZES.lg  // 24px
ICON_SIZES.xl  // 32px
```

### Tailwind Classes
```tsx
import { iconSizeMap } from '@/app/flohmarkt/components/icons';

iconSizeMap.xs  // 'w-3 h-3'
iconSizeMap.md  // 'w-5 h-5'
iconSizeMap.xl  // 'w-8 h-8'
```

## Styling

```tsx
// Tailwind classes
<MapPin size={20} className="text-blue-500 hover:text-blue-700" />

// Inline color
<Home size={24} color="#003366" />

// Stroke width
<Settings size={20} strokeWidth={2.5} />

// Responsive
<Plus className="w-4 h-4 md:w-6 md:h-6" />
```

## Accessibility

Always include `aria-label` for icons without text:

```tsx
// Good ✅
<Trash2 size={20} aria-label="Delete" />
<button><Mail size={16} /> Contact</button> {/* Text provides context */}

// Bad ❌
<Trash2 size={20} /> {/* Missing aria-label */}
```

## Migration from Emojis

The `Emoji` component and `EMOJIS` constants are **deprecated**. Migrate to Lucide:

### Before (Deprecated ❌)
```tsx
import { Emoji, EMOJIS } from '@/app/flohmarkt/components/icons';

<Emoji symbol={EMOJIS.DELETE} label="Delete" />
<Emoji symbol="🗑️" size="lg" />
```

### After (Recommended ✅)
```tsx
import { Trash2, ICONS } from '@/app/flohmarkt/components/icons';

<Trash2 size={20} aria-label="Delete" />
<ICONS.DELETE size={24} aria-label="Delete" />
```

### Migration Mapping

| Emoji | Lucide Icon | ICONS Constant |
|-------|-------------|----------------|
| 🗑️ | Trash2 | ICONS.DELETE |
| ➕ | Plus | ICONS.ADD |
| ✏️📝 | Pencil | ICONS.EDIT |
| ✓ | Check | ICONS.CHECK |
| 🏠 | Home | ICONS.HOME |
| 🗺️ | Map | ICONS.MAP |
| 📋 | List | ICONS.LIST |
| ✉️ | Mail | ICONS.EMAIL |
| ⚠️ | AlertTriangle | ICONS.WARNING |
| 👁️ | Eye | ICONS.PREVIEW |

## Custom SVG Icons (Legacy)

Legacy custom SVG icons still available:

```tsx
import { SuccessIcon, LocationIcon, ArrowIcon } from '@/app/flohmarkt/components/icons';

<SuccessIcon size={20} color="#22c55e" />
<LocationIcon className="text-blue-500" />
<ArrowIcon direction="up" size={16} />
```

**Available:** `SuccessIcon`, `ImageIcon`, `CropIcon`, `StarIcon`, `CloseIcon`, `LocationIcon`, `ArrowIcon`, `UploadIcon`

## Adding New Icons

1. Find icon at https://lucide.dev/icons/
2. Import in `lucide/index.ts`:
   ```tsx
   export { NewIcon } from 'lucide-react';
   ```
3. Use in components:
   ```tsx
   import { NewIcon } from '@/app/flohmarkt/components/icons';
   ```

## TypeScript Support

```tsx
import type { LucideIcon, LucideProps } from '@/app/flohmarkt/components/icons';

const MyIcon: LucideIcon = Trash2;

const props: LucideProps = {
  size: 20,
  color: '#003366',
  'aria-label': 'Delete'
};
```

## Utilities

**Icon Resolver** (`lib/iconResolver.ts`):
- `resolveIcon(value)` - Convert icon name/emoji to component
- `iconToSvgString(value, size)` - Convert to SVG string for Leaflet
- `getIconColorClass(value)` - Get Tailwind color class
- `getIconColorStyle(value)` - Get CSS color value
- `normalizeIconValue(value)` - Normalize emoji to icon name

## Design Guidelines

### Colors
- Primary: `#003366` (dark blue)
- Secondary: `#FFCC00` (yellow)
- Error/Delete: Red variants
- Success: Green variants

### Common Sizes
- 12px (xs) - Very small UI elements
- 16px (sm) - Inline with text
- 20px (md) - Standard buttons
- 24px (lg) - Prominent actions
- 32px (xl) - Hero elements

## Performance

- **Tree-shaking**: Only imported icons in bundle
- **Per icon**: ~1-2KB when tree-shaken
- **Total impact**: ~50-80KB for 40 unique icons
- **No runtime overhead**: Static SVG components

## Resources

- **Lucide Docs**: https://lucide.dev/
- **Icon Browser**: https://lucide.dev/icons/
- **React Guide**: https://lucide.dev/guide/packages/lucide-react
- **GitHub**: https://github.com/lucide-icons/lucide
