# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Quartier-Spots is a Next.js application for managing community flea markets and local events. It allows organizations to create events, manage spots/locations, and handle participant registrations. The app uses a multi-tenant architecture where organizations (tenants) can create multiple events, each with their own spots and settings.

## Development Commands

### Running the App
```bash
npm run dev              # Start development server (http://localhost:3000)
npm run dev:test         # Start dev server with test environment variables
npm run build            # Create production build
npm start                # Start production server
```

### Testing
```bash
npm test                 # Run all Playwright E2E tests (with setup/teardown)
npm run test:smoke       # Quick smoke tests (~5-10s)
npm run test:happy-path  # Happy path user flows
npm run test:negative    # Validation and error handling tests
npm run test:a11y        # Accessibility tests with axe-core
npm run test:mobile      # Cross-device mobile tests
npm run test:ui          # Run tests in Playwright UI mode
npm run test:debug       # Debug tests with Playwright inspector
npm run test:headed      # Run tests with browser visible
npm run test:report      # Show test report from last run
```

**Testing Notes:**
- Tests require a separate Supabase test project (see TESTING_SETUP_GUIDE.md)
- Configure test environment in `.env.test` before running tests
- Test setup/teardown scripts handle data cleanup automatically
- All tests use production build (not dev server) to ensure proper env var compilation

### Code Quality
```bash
npm run lint             # Run ESLint
```

## Architecture

### Multi-Tenant System

The application uses a hierarchical multi-tenant model:
- **Tenants (Organizations)**: Top-level entities representing event organizers
- **Events**: Belong to tenants, can be draft/published/archived
- **Spots**: Belong to events, represent physical locations on a map
- **Memberships**: Link users to tenants with roles (admin/member)

Key relationships:
- Users can be members of multiple tenants
- Tenants can have multiple events
- Events can have multiple spots
- Only tenant admins can create/edit events
- Events have customizable terminology (e.g., "Stand" instead of "Spot")

### State Management

**Global State**: `app/flohmarkt/FlohmarktContext.tsx`
- Single React Context provider managing all application state
- Handles authentication, tenant selection, event management, spot CRUD
- Integrates with Supabase real-time for data synchronization
- All data mutations go through context methods

**Why Context over Redux/Zustand:**
The app uses a single centralized context because the state is deeply interconnected (tenants → events → spots) and needs to stay synchronized. This approach works well for this use case.

### Authentication & Authorization

**Authentication**: Supabase Auth with email/password and Google OAuth
- Client-side: `lib/supabase/client.ts`
- Server-side: `lib/supabase/server.ts`
- Auth state managed in FlohmarktContext

**Authorization Model:**
- **Public**: Can view published events and their spots (RLS enforces status='published')
- **Authenticated**: Can create/join tenants
- **Tenant Members**: Can view all tenant events (including drafts)
- **Tenant Admins**: Can create/edit/delete events, manage members, approve deletion requests

**RLS (Row Level Security):**
Database tables use Supabase RLS policies. Key patterns:
- `profiles` table: Users can only modify their own profile
- `tenants` table: Visible to members via memberships join
- `events` table: Drafts only visible to tenant members, published visible to all
- `spots` table: Inherit visibility from parent event
- `spot_deletion_requests` table: Requests visible to tenant admins

### Routing Structure

```
app/
├── flohmarkt/                          # Main app entry
│   ├── page.tsx                        # Landing/dashboard
│   ├── FlohmarktContext.tsx           # Global state provider
│   ├── types.ts                        # TypeScript interfaces
│   ├── demo/                           # Demo page
│   ├── organizations/                  # Tenant management
│   │   ├── page.tsx                   # List tenants
│   │   └── [slug]/                    # Tenant detail
│   │       ├── page.tsx               # Tenant overview
│   │       └── events/                # Event list for tenant
│   ├── [organizationSlug]/            # Public event access
│   │   ├── page.tsx                   # Organization public page
│   │   └── [eventSlug]/               # Event detail (public view)
│   │       ├── page.tsx               # Event map/list view
│   │       └── register/              # Spot registration form
│   ├── settings/                       # User/tenant settings
│   │   ├── profile/                   # User profile settings
│   │   └── organization/              # Tenant settings (admin only)
│   ├── components/                     # React components
│   │   ├── app/                       # Main app UI (MapView, ListView, SpotForm)
│   │   ├── tenant/                    # Tenant management components
│   │   ├── event/                     # Event management components
│   │   ├── settings/                  # Settings pages
│   │   ├── shared/                    # Shared/reusable components
│   │   └── dashboard/                 # Dashboard components
│   └── lib/                            # Utility functions
│       ├── geocoding.ts               # Nominatim geocoding integration
│       ├── geolocation.ts             # Browser geolocation
│       ├── locationCache.ts           # LocalStorage caching for user location
│       ├── imageUpload.ts             # Supabase Storage image handling
│       ├── loadEventData.ts           # Event data loading utilities
│       ├── addressNormalization.ts    # Address parsing/validation
│       └── spotTerms.ts               # Custom terminology handling
├── auth/                               # Auth routes
│   ├── callback/                      # OAuth callback handler
│   ├── login/                         # Login page
│   └── reset-password/                # Password reset
├── api/                                # API routes
│   ├── debug-env/                     # Environment debugging endpoint
│   └── test-cleanup/                  # Test data cleanup endpoint
└── app/                                # Old/non-flohmarkt pages (if any)
```

### Database Schema

Full schema documented in `database-schema.md`. Key tables:

**Core Tables:**
- `profiles`: User profiles (id matches auth.users.id)
- `tenants`: Organizations/event organizers
- `memberships`: Links users to tenants with roles
- `events`: Flea market events with map settings
- `spots`: Individual locations/stands on the map
- `event_images`: Event cover images and gallery

**Supporting Tables:**
- `spot_deletion_requests`: Moderated deletion workflow
- `contact_messages`: Contact form submissions
- `consents`: GDPR consent tracking
- `geocoding_requests`: Audit log for geocoding API calls

**Important Conventions:**
- All IDs are UUIDs
- Timestamps use `timestamp with time zone`
- Soft deletes not used; RLS controls visibility
- `slug` fields generated from names using `utils/slug.ts`

### Geocoding & Location

**Geocoding Provider**: Nominatim (OpenStreetMap)
- Implementation: `app/flohmarkt/lib/geocoding.ts`
- Audit logging to `geocoding_requests` table
- Address parsing: `app/flohmarkt/lib/addressNormalization.ts`
- House number validation: `app/flohmarkt/lib/houseNumberValidation.ts`

**Location Caching:**
- User location cached in localStorage (`app/flohmarkt/lib/locationCache.ts`)
- Consent modal for caching: `LocationCacheConsentModal.tsx`
- Cached location used for map initialization

**Map Integration:**
- Leaflet for interactive maps
- Center point and boundary radius configured per event
- Spot markers show on map with custom terminology
- Precision levels: exact (pin), street (obfuscated), city (city-level)

### Spot Deletion Workflow

**Two-tier deletion system:**
1. **Admin deletion**: Tenant admins can delete spots directly from dashboard
2. **Public deletion requests**: Public users submit deletion requests that require admin approval

**Deletion Request Flow:**
- User submits request via form (provides name, email, address for verification)
- Request stored in `spot_deletion_requests` table with status='pending'
- Tenant admins see pending requests in dashboard with count badge
- Admins can approve (deletes spot) or reject (with reason)
- Email notifications planned for Phase 5 (currently not implemented)

### Image Upload System

**Storage**: Supabase Storage bucket `event-images`
- Implementation: `app/flohmarkt/lib/imageUpload.ts`
- Images cropped client-side using `react-easy-crop`
- Crop modal: `components/shared/ImageCropModal.tsx`
- Upload component: `components/shared/EventImageUpload.tsx`

**Image Handling:**
- Multiple images per event with ordering (position field)
- Cover image flag (`is_cover`)
- Images stored with path: `{tenant_id}/{event_id}/{filename}`
- Metadata tracked in `event_images` table

### Custom Terminology

Events support custom terminology for "spots" (e.g., "Stand", "Tisch", "Platz"):
- Fields: `spot_term_singular` and `spot_term_plural` in events table
- Helper: `app/flohmarkt/lib/spotTerms.ts`
- Default: "Spot" / "Spots"
- Used throughout UI dynamically

## Important Patterns

### Supabase Client Usage

**Client vs Server:**
- Use `lib/supabase/client.ts` in client components ("use client")
- Use `lib/supabase/server.ts` in server components and API routes
- Server client uses cookies for auth state
- Client uses localStorage for auth state

**Common Pattern:**
```typescript
// Client component
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();

// Server component/API
import { createClient } from '@/lib/supabase/server';
const supabase = await createClient();
```

### Profile Creation

**Critical Pattern:**
- Profiles must exist before creating foreign key references
- Always check profile exists before creating tenant/membership
- Use `maybeSingle()` instead of `single()` to handle missing profiles gracefully
- Pattern used in `FlohmarktContext.tsx` for `createTenant` and `joinTenant`

### Slug Generation

**Consistent slug generation:**
```typescript
import { generateSlug } from '@/app/flohmarkt/utils/slug';
const slug = generateSlug(name); // Converts "My Tenant" → "my-tenant"
```

Used for:
- Tenant URLs: `/flohmarkt/organizations/{tenant-slug}`
- Event URLs: `/flohmarkt/{org-slug}/{event-slug}`

### Event Status Lifecycle

Events have three states:
- `draft`: Only visible to tenant members, cannot be accessed publicly
- `published`: Publicly accessible via URL, spots can be registered
- `archived`: Historical record, read-only, no new spot registrations

**Preview Mode:**
- Draft events can be previewed using `preview_token` query parameter
- Token stored in events table, visible only to tenant members

## Environment Variables

**Required Variables:**
```env
NEXT_PUBLIC_SUPABASE_URL=           # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=      # Supabase anon key (public)
SUPABASE_SERVICE_ROLE_KEY=          # Service role key (server-only, sensitive)
```

**Test Environment:**
- Test-specific values in `.env.test`
- See `.env.test.example` for template
- Never commit actual credentials

## Deployment Considerations

**Environment Variables:**
- `NEXT_PUBLIC_*` variables are compiled into client bundle at build time
- Server-only variables (like `SUPABASE_SERVICE_ROLE_KEY`) never exposed to client
- Rebuild required when changing `NEXT_PUBLIC_*` variables

**Database Migrations:**
- SQL migration files in root directory: `supabase-*.sql`
- Apply via Supabase dashboard SQL editor
- Migration documentation: `DATABASE_MIGRATION_STEPS.md`

**Supabase Setup:**
- RLS policies must be configured (see migration files)
- Storage bucket `event-images` must exist with public read access
- Auth providers configured (email/password, Google OAuth)
- See `GOOGLE_AUTH_SETUP.md` for OAuth configuration

## Common Development Scenarios

### Adding a New Field to Spots

1. Add column to `spots` table in Supabase
2. Update `Spot` interface in `app/flohmarkt/types.ts`
3. Update `addSpot` method in `FlohmarktContext.tsx`
4. Update `SpotForm` component to include the field
5. Update any display components (ListView, MapView)

### Creating a New Event Status

1. Add status to enum in database (if using enum type)
2. Update `TenantEvent` type in `types.ts`
3. Add transition methods in `FlohmarktContext.tsx`
4. Update event management UI in `components/tenant/`

### Adding a New API Route

1. Create route file: `app/api/{route-name}/route.ts`
2. Use server Supabase client: `import { createClient } from '@/lib/supabase/server'`
3. Implement GET/POST/etc handlers
4. Consider RLS - API routes run with user's auth context

## Key Files to Understand

- `app/flohmarkt/FlohmarktContext.tsx` - Central state management, all data operations
- `app/flohmarkt/types.ts` - TypeScript type definitions
- `database-schema.md` - Complete database structure
- `TESTING_SETUP_GUIDE.md` - E2E testing setup instructions
- `lib/supabase/server.ts` & `lib/supabase/client.ts` - Supabase client factories

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL + Auth + Storage + RLS)
- **Maps**: Leaflet + OpenStreetMap
- **Testing**: Playwright + axe-core
- **Image Processing**: react-easy-crop
- **Deployment**: Vercel (or compatible platform)
