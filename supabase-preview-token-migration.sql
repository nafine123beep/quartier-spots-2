-- Migration: Add preview_token column to events table
-- This allows event creators to share draft events with unauthenticated visitors via a special preview link

-- Add preview_token column (UUID for secure, non-guessable tokens)
ALTER TABLE events ADD COLUMN preview_token UUID DEFAULT NULL;

-- Create an index for efficient token lookups (partial index only for non-null tokens)
CREATE INDEX idx_events_preview_token ON events(preview_token) WHERE preview_token IS NOT NULL;

-- Note: Run this migration in Supabase SQL Editor or via the CLI
-- The preview token is generated client-side using crypto.randomUUID() when the user
-- clicks "Generate Preview Link" in the EventControlPanel
