#!/bin/bash
# Post-test teardown script
# Restores .env.local and .env after tests complete

# Remove test .env file
if [ -f ".env" ]; then
  echo "Removing test .env file..."
  rm .env
fi

# Restore original .env if it existed
if [ -f ".env.backup" ]; then
  echo "Restoring .env from backup..."
  mv .env.backup .env
fi

# Restore .env.local
if [ -f ".env.local.backup" ]; then
  echo "Restoring .env.local from backup..."
  mv .env.local.backup .env.local
fi

echo "Teardown complete"
