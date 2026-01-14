import { test as setup } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

setup('prepare test environment', async ({ page }) => {
  console.log('[Global Setup] Waiting for dev server to be ready...');
  
  // Navigate to homepage to trigger compilation
  await page.goto('/');
  
  // Wait a bit for server to fully compile with new env vars
  await page.waitForTimeout(3000);
  
  // Trigger a hard reload to ensure fresh bundle
  await page.reload({ waitUntil: 'domcontentloaded' });
  
  console.log('[Global Setup] Dev server is ready with test environment');
});
