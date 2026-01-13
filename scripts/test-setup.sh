#!/bin/bash
# Pre-test setup script
# Temporarily renames .env.local to prevent it from interfering with test environment

# Kill any running dev server to force a fresh start
echo "Stopping any running dev server..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Rename .env.local to prevent it from being loaded
if [ -f ".env.local" ]; then
  echo "Renaming .env.local to .env.local.backup for testing..."
  mv .env.local .env.local.backup
fi

# Give processes time to fully terminate
sleep 1
