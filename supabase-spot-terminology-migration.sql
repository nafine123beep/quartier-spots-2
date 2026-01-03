-- Migration: Add custom spot terminology to events table
-- This allows event organizers to customize the term "Spots" (e.g., "Stände", "Teilnehmer")

-- Add columns for custom spot terminology
ALTER TABLE events ADD COLUMN IF NOT EXISTS spot_term_singular TEXT DEFAULT 'Spot';
ALTER TABLE events ADD COLUMN IF NOT EXISTS spot_term_plural TEXT DEFAULT 'Spots';

-- Add comments for documentation
COMMENT ON COLUMN events.spot_term_singular IS 'Custom singular term for spots (e.g., "Stand", "Teilnehmer"). Defaults to "Spot".';
COMMENT ON COLUMN events.spot_term_plural IS 'Custom plural term for spots (e.g., "Stände", "Teilnehmer"). Defaults to "Spots".';
