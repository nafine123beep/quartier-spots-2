#!/bin/bash
# Post-test teardown script
# Restores .env.local after tests complete

if [ -f ".env.local.backup" ]; then
  echo "Restoring .env.local from backup..."
  mv .env.local.backup .env.local
fi
