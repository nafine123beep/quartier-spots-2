# Quartier-Spots Testing Suite

Comprehensive E2E testing for the Quartier-Spots application using Playwright.

## Overview

This test suite covers:
- ✅ **Smoke Tests**: App startup and core page loading
- ✅ **Happy Path E2E**: Complete user flows (organizer & participant)
- ✅ **Negative Tests**: Validation errors and authorization
- ✅ **Cross-Device**: iPhone Safari + Android Chrome emulation
- ✅ **Accessibility**: WCAG 2.1 AA compliance with axe-core

**Target Execution Time**: <30 seconds (achieved through parallel execution)

## Setup

### 1. Install Dependencies

Dependencies are already installed (see `package.json`):
- `@playwright/test` - E2E testing framework
- `@axe-core/playwright` - Accessibility testing

### 2. Configure Test Environment

Create a Supabase test project and configure credentials:

```bash
# Copy example environment file
cp .env.test.example .env.test

# Edit .env.test with your Supabase test project credentials
```

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Test project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (for test setup/cleanup)
- `TEST_ORGANIZER_EMAIL` - Test organizer email
- `TEST_MEMBER_EMAIL` - Test member email
- `TEST_PASSWORD` - Test user password

### 3. Create Test Users

In your Supabase test project, create two users:
1. Organizer: `organizer@test.local` with password `test-password-123`
2. Member: `member@test.local` with password `test-password-123`

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Specific Test Groups

```bash
# Smoke tests (fastest, ~5s)
npm run test:smoke

# Happy path tests (~15s)
npm run test:happy-path

# Negative/validation tests (~10s)
npm run test:negative

# Accessibility tests (~10s)
npm run test:a11y

# Mobile tests (~15s)
npm run test:mobile
```

### Development Tools

```bash
# Run with UI (interactive)
npm run test:ui

# Run in headed mode (see browser)
npm run test:headed

# Debug mode (step through tests)
npm run test:debug

# View test report
npm run test:report
```

## Test Structure

```
tests/
├── e2e/
│   ├── smoke/               # App startup & core pages
│   ├── happy-path/          # Complete user flows
│   ├── negative/            # Error handling & validation
│   ├── cross-device/        # Mobile device tests
│   └── accessibility/       # WCAG compliance
├── fixtures/
│   ├── data-generators.ts   # Test data creation
│   ├── supabase-helpers.ts  # Database utilities
│   └── auth.ts              # Authentication helpers
└── README.md
```

## Test Coverage

### Smoke Tests (3 tests)
- App starts successfully
- Homepage loads without errors
- Login page renders
- Public event page loads
- Spot registration page loads

### Happy Path (2 tests)
- Participant views event and registers spot
- Complete flow: event access → registration → list/map display
- Event images display correctly

### Negative Tests (5 tests)
- Empty required fields validation
- Invalid address error handling
- Consent checkbox requirement
- Draft event access control
- Invalid preview token rejection

### Accessibility (8 tests)
- WCAG 2.1 AA compliance on all pages
- Keyboard navigation
- Focus indicators
- Touch target sizes (44x44px minimum)
- 200% zoom support

### Cross-Device (6 tests)
- iPhone Safari: Touch interactions, responsive layout
- Android Chrome: Scrolling, button sizes

### Highlights Feature Tests

**Smoke Tests** (`tests/e2e/smoke/highlights.spec.ts`):
- Highlights tab accessibility for admins
- Highlight form modal opens/closes
- Highlights render on public map

**Happy Path Tests** (`tests/e2e/happy-path/highlights-management.spec.ts`):
- Admin creates, edits, and deletes highlights
- Custom highlight types creation and usage
- Highlights display in public list and map views

**Accessibility Tests** (`tests/e2e/accessibility/highlights-a11y.spec.ts`):
- Highlights management panel WCAG compliance
- Keyboard navigation in highlight form
- Highlights in list view are keyboard accessible
- Proper ARIA labels and attributes

**Mobile Tests** (`tests/e2e/cross-device/highlights-mobile.spec.ts`):
- Labels always visible on mobile map
- Mobile carousel excludes highlights
- Highlight form usability on mobile

**Unit Tests** (`tests/unit/highlightConfig.test.ts`):
- Base highlight types validation
- Icon configuration correctness
- Type label and icon retrieval functions
- Custom type handling

Run highlight-specific unit tests:
```bash
npx ts-node tests/unit/highlightConfig.test.ts
```

## CI/CD Integration

Tests run automatically on GitHub Actions:

### Parallel Execution Strategy
- 4 jobs run in parallel: smoke, happy-path, negative, accessibility
- Mobile tests run separately (only on main branch)
- Total CI time: ~5-7 minutes

### Required GitHub Secrets

Configure in repository settings:
- `TEST_SUPABASE_URL`
- `TEST_SUPABASE_ANON_KEY`
- `TEST_SUPABASE_SERVICE_KEY`
- `TEST_ORGANIZER_EMAIL`
- `TEST_MEMBER_EMAIL`
- `TEST_PASSWORD`

## Test Data Management

### Fresh Data Per Run
- Tests generate unique data using timestamps
- No conflicts between parallel test runs
- Deterministic test behavior

### Automatic Cleanup
- Test data cleaned up after each test
- Orphaned data cleaned up in `afterEach` hooks
- Manual cleanup available via `supabase-helpers`

## Performance Optimization

### Achieving <30s Target

**Current execution times**:
- Smoke: ~5s
- Happy Path: ~15s
- Negative: ~10s
- Accessibility: ~5s
- **Total**: ~20-25s ✅

**Optimization techniques**:
1. Parallel execution (6 workers locally, 4 in CI)
2. Authentication state reuse (future improvement)
3. Selective test execution
4. Efficient database operations

## Troubleshooting

### Tests Failing Locally

1. **Check environment**: Verify `.env.test` has correct Supabase credentials
2. **Dev server running**: Tests start dev server automatically, but ensure port 3000 is available
3. **Test users exist**: Verify test users created in Supabase test project
4. **Clean test data**: Run cleanup if old test data interfering

### Flaky Tests

- Tests designed to be deterministic with unique data generation
- If flakiness occurs, check network stability and Supabase response times
- Use `test:debug` to step through failing tests

### CI Failures

- Check GitHub Secrets are configured correctly
- Verify Supabase test project is active and accessible
- Review test artifacts uploaded by CI for debugging

## Writing New Tests

### Example Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { createPublishedEvent, supabaseAdmin } from '../../fixtures/supabase-helpers';

test.describe('My New Test Suite', () => {
  let tenantId: string;

  test.afterEach(async () => {
    // Always cleanup
    if (tenantId) {
      await supabaseAdmin.from('tenants').delete().eq('id', tenantId);
    }
  });

  test('my test case', async ({ page }) => {
    // Setup
    const { orgSlug, eventSlug, tenantId: tid } = await createPublishedEvent();
    tenantId = tid;

    // Test
    await page.goto(`/flohmarkt/${orgSlug}/${eventSlug}`);
    await expect(page.locator('h1')).toBeVisible();
  });
});
```

### Best Practices

1. **Use fixtures**: Leverage `supabase-helpers` and `data-generators`
2. **Clean up**: Always delete test data in `afterEach`
3. **Unique data**: Use `generateUniqueId()` for test data
4. **Wait properly**: Use `expect().toBeVisible()` instead of arbitrary timeouts
5. **Descriptive names**: Test names should describe user behavior

## Resources

- [Playwright Documentation](https://playwright.dev)
- [axe-core Accessibility Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## Maintenance

- **Daily**: Monitor CI results, fix failures immediately
- **Weekly**: Review test execution times, update if needed
- **Monthly**: Audit test coverage, add tests for new features
- **Quarterly**: Update device profiles, review accessibility standards
