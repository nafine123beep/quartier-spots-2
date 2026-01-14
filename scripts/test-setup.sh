#!/bin/bash
# Pre-test setup script
# Temporarily renames .env.local to prevent it from interfering with test environment

echo "[test-setup.sh] Starting at $(date +%T)"

# Kill any running dev server to force a fresh start
echo "Stopping any running dev server..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Backup .env.local if it exists
if [ -f ".env.local" ]; then
  echo "Backing up .env.local to .env.local.backup..."
  mv .env.local .env.local.backup
fi

# Backup .env if it exists (to restore later)
if [ -f ".env" ]; then
  echo "Backing up .env to .env.backup..."
  mv .env .env.backup
fi

# Copy .env.test to .env so Next.js loads test credentials
echo "Copying .env.test to .env for test run..."
cp .env.test .env
echo "Test environment variables loaded into .env"

# Clear Next.js cache to ensure fresh env vars are loaded
echo "Clearing Next.js cache..."
rm -rf .next

# CRITICAL: Also clear potential Turbopack cache
if [ -d "node_modules/.cache" ]; then
  echo "Clearing node_modules/.cache..."
  rm -rf node_modules/.cache
fi

# CRITICAL: Touch the Supabase client file to force Next.js to recompile it
# This ensures the new environment variables get baked into the client bundle
echo "Triggering recompilation of Supabase client..."
touch lib/supabase/client.ts

# Give file system time to sync and processes to terminate
echo "Waiting for file system sync..."
sleep 2

echo "[test-setup.sh] Completed at $(date +%T)"
