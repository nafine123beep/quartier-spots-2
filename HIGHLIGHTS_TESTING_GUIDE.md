# Event Highlights - Manual Testing Guide

This guide provides step-by-step instructions for manually testing the Event Highlights feature.

## Prerequisites

Before testing, ensure:
- [ ] Database migration has been applied successfully
- [ ] Application is running locally or deployed to test environment
- [ ] You have admin access to a test organization/event
- [ ] You have a non-admin test account for access control testing

---

## Phase 10: Manual Testing Checklist

### A. Admin Functions

#### Creating Highlights

- [ ] **Test 1.1**: Navigate to EventDetail → Highlights tab
  - Expected: Tab is visible and clickable for admins
  - Expected: Shows empty state if no highlights exist

- [ ] **Test 1.2**: Click "Highlight hinzufügen" button
  - Expected: Modal opens with form
  - Expected: Type dropdown shows 8 base types
  - Expected: All form fields are visible

- [ ] **Test 1.3**: Create highlight with base type (Registration)
  - Fill: Type = "Registration", Title = "Main Entrance", Description = "Check-in here"
  - Fill: Address = "Königstraße 1, 90402 Nürnberg"
  - Click: "Adresse geocodieren und Pin setzen"
  - Expected: Success message "Standort gefunden"
  - Expected: Coordinates displayed
  - Click: "Highlight erstellen"
  - Expected: Highlight appears in table with 📋 icon

- [ ] **Test 1.4**: Create highlight with each base type
  - [ ] Registration (📋)
  - [ ] Toilets (🚻)
  - [ ] Food & Drinks (🍽️)
  - [ ] Start (🚩)
  - [ ] Finish (🏁)
  - [ ] Awareness Team (🛡️)
  - [ ] Info Point (ℹ️)
  - [ ] Parking (🅿️)
  - Expected: Each displays correct icon and label

#### Creating Custom Types

- [ ] **Test 2.1**: Click "Typen verwalten" button
  - Expected: Custom Type Manager modal opens
  - Expected: Shows list of existing custom types (if any)

- [ ] **Test 2.2**: Create custom type
  - Fill: Type Key = "first_aid_station"
  - Fill: Label = "Erste-Hilfe Station"
  - Select: Icon = ⚕️
  - Click: "Typ hinzufügen"
  - Expected: Custom type appears in list
  - Expected: No errors

- [ ] **Test 2.3**: Create highlight with custom type
  - Close custom types modal
  - Click "Highlight hinzufügen"
  - Expected: Custom type appears in dropdown under "Benutzerdefinierte Typen"
  - Select: Custom type "first_aid_station"
  - Expected: Icon ⚕️ displays
  - Fill: Title = "Sanitätszelt"
  - Complete form and save
  - Expected: Highlight created successfully with custom icon

- [ ] **Test 2.4**: Try creating duplicate custom type key
  - Open "Typen verwalten"
  - Try: Type Key = "first_aid_station" (duplicate)
  - Expected: Error or warning about duplicate key

#### Editing Highlights

- [ ] **Test 3.1**: Click "Bearbeiten" on existing highlight
  - Expected: Modal opens with all fields pre-filled
  - Expected: Current values displayed correctly

- [ ] **Test 3.2**: Edit highlight title
  - Change: Title from "Main Entrance" to "Haupteingang"
  - Click: "Änderungen speichern"
  - Expected: Table updates with new title

- [ ] **Test 3.3**: Edit highlight location
  - Edit existing highlight
  - Change: Address to different location
  - Click: "Adresse geocodieren"
  - Expected: New coordinates found
  - Adjust pin if needed
  - Save
  - Expected: Highlight location updated on map

- [ ] **Test 3.4**: Edit highlight type
  - Edit existing highlight
  - Change: Type from "Registration" to "Info Point"
  - Save
  - Expected: Icon changes from 📋 to ℹ️

#### Deleting Highlights

- [ ] **Test 4.1**: Click "Löschen" on highlight
  - Expected: Confirmation dialog appears
  - Expected: Dialog shows highlight title

- [ ] **Test 4.2**: Confirm deletion
  - Click: "OK" in confirmation dialog
  - Expected: Highlight removed from table
  - Expected: If last highlight, empty state appears

- [ ] **Test 4.3**: Cancel deletion
  - Click: "Löschen"
  - Click: "Cancel" in dialog
  - Expected: Highlight remains in table

#### Deleting Custom Types

- [ ] **Test 5.1**: Try deleting custom type in use
  - Create highlight with custom type
  - Try: Delete that custom type
  - Expected: Error or warning (cannot delete type in use)

- [ ] **Test 5.2**: Delete unused custom type
  - Create custom type without using it
  - Delete: The custom type
  - Expected: Type removed from list
  - Expected: No longer appears in highlight form dropdown

---

### B. Map Display

#### Desktop Map

- [ ] **Test 6.1**: View highlights on public map (desktop)
  - Navigate: `/flohmarkt/{org-slug}/{event-slug}`
  - Click: "🗺️ Karte" tab
  - Expected: Map loads successfully
  - Expected: Highlights appear as yellow circular markers
  - Expected: Regular spots appear as blue default markers
  - Expected: Highlights render above spots (visible on top)

- [ ] **Test 6.2**: Hover over highlight marker (desktop)
  - Hover: Mouse over highlight marker
  - Expected: Label appears below marker icon
  - Expected: Label shows highlight title
  - Move mouse away
  - Expected: Label disappears

- [ ] **Test 6.3**: Click highlight marker
  - Click: Highlight marker
  - Expected: Popup opens
  - Expected: Popup shows icon, title, and description
  - Expected: If address is public, shows address

- [ ] **Test 6.4**: Multiple highlights at close proximity
  - Create: 2-3 highlights near each other
  - View: Map
  - Expected: All markers visible (may overlap slightly)
  - Expected: Can click each marker individually
  - Expected: z-index ensures highlights always on top

#### Mobile Map

- [ ] **Test 7.1**: View highlights on mobile (viewport width < 768px)
  - Set: Browser viewport to 375x667 (iPhone size)
  - Navigate: Public event map
  - Expected: Highlights display as yellow markers
  - Expected: Labels are ALWAYS visible (not hover-only)
  - Expected: Labels readable and not overlapping excessively

- [ ] **Test 7.2**: Tap highlight on mobile
  - Tap: Highlight marker
  - Expected: Popup opens
  - Expected: Touch targets are adequate size (48x48px minimum)

- [ ] **Test 7.3**: Mobile carousel excludes highlights
  - View: Map on mobile
  - Expected: Bottom carousel shows only regular spots
  - Expected: Highlights NOT in carousel
  - Expected: Highlights only visible as map markers

---

### C. Public View (List)

- [ ] **Test 8.1**: Highlights section in list view
  - Navigate: `/flohmarkt/{org-slug}/{event-slug}`
  - Click: "📋 Liste" tab
  - Expected: "Event Highlights" section appears at top
  - Expected: Yellow background (bg-yellow-50)
  - Expected: Each highlight shows icon, title, description

- [ ] **Test 8.2**: Click highlight in list
  - Click: Any highlight item
  - Expected: Navigates to map view
  - Expected: Map centers on that highlight
  - Expected: Highlight popup opens automatically

- [ ] **Test 8.3**: Public address display
  - Create: Highlight with "Adresse öffentlich anzeigen" checked
  - View: List view
  - Expected: Address shown below description (📍 {address})
  - Create: Highlight with address NOT public
  - Expected: Address not shown in list

- [ ] **Test 8.4**: Empty state
  - Event: With no highlights
  - View: List view
  - Expected: No "Event Highlights" section visible
  - Expected: Only regular spots section shown

---

### D. Access Control

#### Admin Access

- [ ] **Test 9.1**: Admin sees Highlights tab
  - Login: As admin user
  - Navigate: EventDetail
  - Expected: "Highlights" tab visible in navigation

- [ ] **Test 9.2**: Admin can perform all actions
  - As admin: Create, edit, delete highlights
  - Expected: All actions succeed
  - Expected: No permission errors

#### Non-Admin Access

- [ ] **Test 10.1**: Member cannot see Highlights tab
  - Login: As non-admin member
  - Navigate: EventDetail
  - Expected: "Highlights" tab NOT visible
  - Expected: Only "Übersicht", "Spots", "Löschanfragen" tabs shown

- [ ] **Test 10.2**: Direct URL access blocked
  - Login: As non-admin member
  - Try: Direct navigation to highlights tab (if possible)
  - Expected: Access denied or tab not functional

- [ ] **Test 10.3**: Regular users cannot create highlights
  - Login: As non-admin (or not logged in)
  - Try: API call to create highlight (use browser dev tools)
  - Expected: Database RLS policy blocks insertion
  - Expected: Error returned

#### Public Access

- [ ] **Test 11.1**: Anonymous users can view highlights
  - Not logged in
  - Navigate: Public event page
  - View: List and Map views
  - Expected: Highlights visible in both views
  - Expected: No edit/delete buttons

- [ ] **Test 11.2**: Highlights visible on published events only
  - Event: Status = "draft"
  - Not logged in
  - Try: Access event
  - Expected: Cannot access draft event or highlights not shown

---

### E. Edge Cases

#### Data Validation

- [ ] **Test 12.1**: Create highlight without required fields
  - Open: Highlight form
  - Leave: Type empty
  - Try: Submit
  - Expected: Error "Bitte wähle einen Highlight-Typ aus"

- [ ] **Test 12.2**: Create highlight without title
  - Fill: Type only
  - Leave: Title empty
  - Try: Submit
  - Expected: Error "Bitte gib einen Titel ein"

- [ ] **Test 12.3**: Create highlight without geocoding
  - Fill: Type and Title
  - Skip: Geocoding step
  - Try: Submit
  - Expected: Error "Bitte geocodiere die Adresse oder setze den Pin auf der Karte"

#### Boundary Validation

- [ ] **Test 13.1**: Highlight outside event boundary
  - Event: Has `boundary_radius_meters` configured
  - Create: Highlight with address far outside boundary
  - Geocode
  - Expected: Warning "Warnung: Dieser Standort liegt außerhalb des Event-Bereichs"
  - Try: Submit
  - Expected: Confirmation dialog "Dieser Standort liegt außerhalb des Event-Bereichs. Trotzdem fortfahren?"
  - Cancel
  - Expected: Highlight not created
  - Try again and confirm
  - Expected: Highlight created despite warning

- [ ] **Test 13.2**: Highlight just inside boundary
  - Create: Highlight near edge of boundary
  - Expected: No warning
  - Expected: Saves successfully

#### Long Text Handling

- [ ] **Test 14.1**: Very long highlight title (>100 chars)
  - Try: Enter title longer than 100 characters
  - Expected: Input truncated or validation error

- [ ] **Test 14.2**: Very long description (>500 chars)
  - Try: Enter description longer than 500 characters
  - Expected: Input truncated or validation error

- [ ] **Test 14.3**: Long title display in table
  - Create: Highlight with max-length title
  - View: Table
  - Expected: Title wraps or truncates gracefully
  - Expected: No layout breaking

#### Special Characters

- [ ] **Test 15.1**: Highlight with special characters in title
  - Title: "Info-Point (Main) – Östlicher Eingang"
  - Expected: Saves and displays correctly
  - Expected: No encoding issues

- [ ] **Test 15.2**: Custom type key with invalid characters
  - Try: Type Key = "first-aid station" (spaces/hyphens)
  - Expected: Validation error or auto-sanitization
  - Expected: Suggests valid format (lowercase, underscores)

#### Empty Event

- [ ] **Test 16.1**: Event with no highlights
  - View: Admin highlights tab
  - Expected: Empty state shown
  - Expected: "Noch keine Highlights vorhanden" message
  - Expected: "Erstes Highlight erstellen" button

- [ ] **Test 16.2**: Event with only highlights (no regular spots)
  - Create: Multiple highlights, no spots
  - View: Public list
  - Expected: "Event Highlights" section shows
  - Expected: "Spots" section shows "Noch keine {spots} registriert"

#### Event Deletion

- [ ] **Test 17.1**: Delete event with highlights
  - Create: Event with multiple highlights
  - Delete: The event
  - Expected: Cascade deletion removes highlights
  - Expected: Custom types for that event also deleted
  - Expected: No orphaned data

---

## Database Verification

Run these SQL queries in Supabase to verify data integrity:

### Check Highlights Created Correctly

```sql
-- View all highlights for an event
SELECT
  id,
  title,
  is_highlight,
  highlight_type,
  highlight_icon,
  lat,
  lng,
  address_public,
  created_at
FROM spots
WHERE event_id = '<YOUR_EVENT_ID>'
  AND is_highlight = true;
```

Expected: All highlights have `is_highlight = true`, non-null `highlight_type` and `highlight_icon`

### Check Custom Types

```sql
-- View custom types for an event
SELECT *
FROM event_custom_highlight_types
WHERE event_id = '<YOUR_EVENT_ID>';
```

Expected: Custom types have unique `type_key` per event

### Verify RLS Policies

```sql
-- Switch to a non-admin user context
SET ROLE authenticated;
SET request.jwt.claims.sub = '<NON_ADMIN_USER_ID>';

-- Try to insert a highlight (should fail)
INSERT INTO spots (
  tenant_id,
  event_id,
  is_highlight,
  highlight_type,
  highlight_icon,
  title,
  lat,
  lng
) VALUES (
  '<TENANT_ID>',
  '<EVENT_ID>',
  true,
  'registration',
  '📋',
  'Unauthorized Highlight',
  49.42,
  11.06
);
```

Expected: Error "new row violates row-level security policy"

### Check Cascade Deletion

```sql
-- Before deleting event, note highlight count
SELECT COUNT(*) FROM spots
WHERE event_id = '<EVENT_ID>' AND is_highlight = true;

-- Delete event
DELETE FROM events WHERE id = '<EVENT_ID>';

-- Check highlights deleted
SELECT COUNT(*) FROM spots
WHERE event_id = '<EVENT_ID>' AND is_highlight = true;
```

Expected: Count = 0 after event deletion

---

## Performance Considerations

### Loading Performance

- [ ] **Test 18.1**: Initial load time with many highlights
  - Create: 20+ highlights for one event
  - Clear: Browser cache
  - Navigate: Public event page
  - Measure: Time to first render
  - Expected: < 3 seconds for initial load

- [ ] **Test 18.2**: Map rendering performance
  - Event: With 20+ highlights + 50+ spots
  - Open: Map view
  - Expected: All markers render smoothly
  - Expected: No janky animations or lag
  - Expected: Smooth panning and zooming

### Query Performance

- [ ] **Test 18.3**: Single query loads spots and highlights
  - Open: Browser DevTools Network tab
  - Navigate: Public event page
  - Check: Database queries
  - Expected: Single query fetches both spots and highlights
  - Expected: No separate highlight query

### Memory Usage

- [ ] **Test 18.4**: Memory doesn't leak on tab switching
  - Open: Public event page
  - Switch: Between List and Map tabs 10+ times
  - Check: Browser memory usage (DevTools Performance tab)
  - Expected: Memory stays stable
  - Expected: No continuous growth

---

## Browser Compatibility

Test in multiple browsers:

### Desktop Browsers

- [ ] **Chrome** (latest)
  - All features work
  - Labels show on hover (desktop)

- [ ] **Firefox** (latest)
  - All features work
  - CSS styles render correctly

- [ ] **Safari** (latest)
  - All features work
  - Emoji icons display correctly

- [ ] **Edge** (latest)
  - All features work
  - Map interactions smooth

### Mobile Browsers

- [ ] **iOS Safari** (iPhone)
  - Labels always visible
  - Touch targets adequate
  - No zoom issues

- [ ] **Android Chrome** (Pixel/Samsung)
  - Labels always visible
  - Smooth scrolling
  - Map gestures work

---

## Reporting Issues

If you encounter any issues during testing:

1. **Document the issue**:
   - What you did (steps to reproduce)
   - What you expected
   - What actually happened
   - Browser/device information

2. **Check console for errors**:
   - Open browser DevTools
   - Check Console tab for JavaScript errors
   - Check Network tab for failed requests

3. **Capture evidence**:
   - Screenshot or screen recording
   - Browser console logs
   - Network request details

4. **Database state**:
   - Run SQL queries to check data
   - Note any orphaned records

5. **Create issue report**:
   - Use GitHub Issues
   - Tag as `bug` and `highlights-feature`
   - Include all documentation above

---

## Success Criteria

All tests pass when:

✅ Admins can create, edit, and delete highlights
✅ Custom types can be created and used
✅ Highlights display correctly on map (yellow markers, correct icons)
✅ Labels show on hover (desktop) and always (mobile)
✅ Highlights display in list view with yellow background
✅ Non-admins cannot access highlight management
✅ Public users can view but not edit highlights
✅ Boundary validation works correctly
✅ All edge cases handled gracefully
✅ No console errors or warnings
✅ Database integrity maintained
✅ Performance is acceptable
✅ Works across all browsers/devices

---

## Next Steps After Testing

Once all manual tests pass:

1. ✅ Mark Phase 10 as complete
2. 📝 Document any issues found (and fixed)
3. 🚀 Prepare for production deployment
4. 📊 Monitor production metrics after deployment
5. 📖 Update user documentation with highlights feature

---

**Last Updated**: 2026-01-27
**Version**: 1.0
**Tested By**: _____________
**Date Tested**: _____________
