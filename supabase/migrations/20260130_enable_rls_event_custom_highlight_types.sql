-- Migration: Enable RLS on event_custom_highlight_types
-- Date: 2026-01-30
-- Description: Enables Row Level Security on event_custom_highlight_types table to enforce existing policies

-- Enable RLS on the table
ALTER TABLE "public"."event_custom_highlight_types" ENABLE ROW LEVEL SECURITY;

-- Verify existing policies are in place (should already exist from previous migrations):
-- 1. "Anyone can view custom types for published events" - SELECT policy
-- 2. "Members can manage custom types" - INSERT/UPDATE/DELETE policy for tenant members

-- Note: This migration only enables RLS. The policies were created in migration 20260127_add_event_highlights.sql
-- and updated in migration 20260128_allow_members_manage_highlights.sql
