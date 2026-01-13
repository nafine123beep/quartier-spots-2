import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Quartier-Spots E2E testing
 *
 * Key features:
 * - Parallel execution for speed (<30s target)
 * - Device emulation for cross-device testing
 * - Test grouping by category (smoke, happy-path, negative, etc.)
 */
export default defineConfig({
  testDir: './tests/e2e',

  // Parallel execution for speed
  fullyParallel: true,
  workers: process.env.CI ? 4 : 6,

  // Retry strategy for flaky tests
  retries: process.env.CI ? 2 : 0,

  // Timeout settings (critical for <30s target)
  timeout: 15000, // 15s per test
  expect: {
    timeout: 5000, // 5s for assertions
  },

  // Forbid test.only in CI
  forbidOnly: !!process.env.CI,

  // Test execution options
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // Navigation timeout
    navigationTimeout: 10000,
  },

  // Device profiles for cross-device testing
  projects: [
    // Desktop (default for most tests)
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Mobile devices (run selectively)
    {
      name: 'mobile-safari',
      testMatch: /cross-device\/mobile-iphone\.spec\.ts/,
      use: {
        ...devices['iPhone 13'],
        // Force Safari user agent
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
      },
    },
    {
      name: 'mobile-chrome',
      testMatch: /cross-device\/mobile-android\.spec\.ts/,
      use: { ...devices['Pixel 5'] },
    },
  ],

  // Reporters
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],

  // Web server (starts dev server if not running)
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
