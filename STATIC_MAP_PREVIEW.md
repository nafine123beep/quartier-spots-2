# Static Map Preview for Event Cards

## Overview

Event cards now display static map previews for events without uploaded images, providing visual context and geographic identity.

## Implementation

### Priority System

Event preview images follow this priority:

1. **Uploaded Image** - If event has photos, show cover image (or first image)
2. **Static Map Preview** - If no images but has coordinates, show map centered on event location
3. **Placeholder** - If no images and no coordinates, show generic placeholder with icon

### Files Modified

#### New Files

**`app/flohmarkt/lib/staticMapPreview.ts`**
- Helper functions for generating static map URLs
- Uses OpenStreetMap's free static map service (staticmap.openstreetmap.de)
- Functions:
  - `getStaticMapUrl(lat, lng, width, height, zoom)` - Generates static map URL
  - `getEventPreviewImage(event, width, height)` - Returns appropriate preview image for event
  - `getEventPreviewImageUrl(event, width, height)` - Simplified version returning just URL

#### Updated Files

**`app/flohmarkt/components/tenant/EventCard.tsx`**
- Updated to use `getEventPreviewImage()` helper
- Always renders image container (instead of conditional rendering)
- Handles three image types: uploaded, map, placeholder
- Proper accessibility with descriptive alt text

## Usage

### In Components

```typescript
import { getEventPreviewImage } from "../../lib/staticMapPreview";

// Get preview image info
const previewImage = getEventPreviewImage(event, 600, 160);

// Use the result
if (previewImage.type === "map") {
  // Render static map image
  <img src={previewImage.url} alt={previewImage.alt} />
} else if (previewImage.type === "uploaded") {
  // Render uploaded image
  <img src={getPublicImageUrl(coverImage.storage_path)} alt={previewImage.alt} />
} else {
  // Render placeholder
  <div>No image available</div>
}
```

### Static Map URL Generation

```typescript
import { getStaticMapUrl } from "../../lib/staticMapPreview";

// Generate static map URL for coordinates
const mapUrl = getStaticMapUrl(
  52.520008,  // latitude
  13.404954,  // longitude
  600,        // width in pixels
  400,        // height in pixels
  14          // zoom level (1-19)
);
```

## Map Service

### Provider

**OpenStreetMap Static Maps** (staticmap.openstreetmap.de)
- Free service (no API key required)
- Uses OpenStreetMap data
- Generates static PNG images

### URL Pattern

```
https://staticmap.openstreetmap.de/staticmap.php?center={lat},{lng}&zoom={zoom}&size={width}x{height}&maptype=mapnik
```

### Parameters

- `center`: Latitude and longitude (e.g., "52.520008,13.404954")
- `zoom`: Zoom level (1-19, default 14)
- `size`: Image dimensions in pixels (e.g., "600x400")
- `maptype`: Map style (always "mapnik" for standard OSM)

## Accessibility

### Alt Text

The helper automatically generates appropriate alt text:

- **Uploaded image**: "Bild für {Event Title}"
- **Map preview**: "Karten-Vorschau für {Event Title}"
- **Placeholder**: "Kein Bild verfügbar"

### Screen Reader Support

- Placeholder icon marked with `aria-hidden="true"`
- Alt text provided via `sr-only` span for screen readers

## Performance

### Optimizations

1. **Static images only** - No interactive map components in event cards
2. **Lazy loading** - Browser native lazy loading for images
3. **No API overhead** - Free service with no rate limits
4. **Cached by browser** - Static URLs are cacheable

### Fallback Behavior

- If coordinates are missing → show placeholder
- If static map service fails → browser shows broken image (can be caught with `onError` handler)

## Testing

### Manual Testing Scenarios

1. **Event with uploaded image**
   - ✓ Should display uploaded cover image
   - ✓ Alt text: "Bild für {title}"

2. **Event without image, with coordinates**
   - ✓ Should display static map centered on coordinates
   - ✓ Alt text: "Karten-Vorschau für {title}"
   - ✓ Map should be centered correctly

3. **Event without image, without coordinates**
   - ✓ Should display placeholder with icon
   - ✓ Alt text: "Kein Bild verfügbar"

4. **Responsive behavior**
   - ✓ Compact variant: 128px height
   - ✓ Default variant: 160px height
   - ✓ Width adapts to container

### Test Locations

- **Dashboard**: "Nächste Events" section uses compact variant
- **Organization Events List**: Uses default variant

## Future Enhancements

Potential improvements (not currently implemented):

1. **Add markers** - Show event location with a pin on the map
2. **Custom zoom** - Allow events to specify preferred zoom level
3. **Boundary circle** - Show event boundary radius on map preview
4. **Fallback image** - Custom placeholder image instead of icon
5. **Error handling** - Catch map loading errors and show fallback
6. **Map caching** - Cache generated map URLs in localStorage

## Environment Variables

**No environment variables required** - the free staticmap.openstreetmap.de service requires no API keys.

## Notes

- Map previews are purely visual - no interaction, markers, or overlays
- Zoom level is fixed at 14 (good for neighborhood-level context)
- Service is free but should be used reasonably (avoid excessive requests)
- Static maps update when event coordinates change (no caching)
