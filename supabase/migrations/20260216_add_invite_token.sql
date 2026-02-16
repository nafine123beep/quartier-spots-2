-- Add invite_token column to tenants table for invite link support
-- Token is cryptographically random, unique per tenant, nullable (generated on first dashboard load)
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS invite_token TEXT UNIQUE;
