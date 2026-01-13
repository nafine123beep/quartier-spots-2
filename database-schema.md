# Flohmarkt-App Datenmodell (Supabase)

## Tabellen und Spalten
[
  {
    "table_name": "consents",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_name": "consents",
    "column_name": "tenant_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "consents",
    "column_name": "subject_type",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "consents",
    "column_name": "subject_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "consents",
    "column_name": "consent_type",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "consents",
    "column_name": "consent_version",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "consents",
    "column_name": "granted",
    "data_type": "boolean",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "consents",
    "column_name": "granted_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_name": "consents",
    "column_name": "granted_by",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "contact_messages",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_name": "contact_messages",
    "column_name": "tenant_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "contact_messages",
    "column_name": "event_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "contact_messages",
    "column_name": "sender_name",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "contact_messages",
    "column_name": "sender_email",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "contact_messages",
    "column_name": "subject",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "contact_messages",
    "column_name": "message",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "contact_messages",
    "column_name": "honeypot_triggered",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "false"
  },
  {
    "table_name": "contact_messages",
    "column_name": "ip_address",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "contact_messages",
    "column_name": "user_agent",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "contact_messages",
    "column_name": "status",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": "'pending'::text"
  },
  {
    "table_name": "contact_messages",
    "column_name": "sent_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "contact_messages",
    "column_name": "error_message",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "contact_messages",
    "column_name": "recipient_emails",
    "data_type": "ARRAY",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "contact_messages",
    "column_name": "recipient_count",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": "0"
  },
  {
    "table_name": "contact_messages",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "contact_messages",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "contact_rate_limits",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_name": "contact_rate_limits",
    "column_name": "identifier_type",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "contact_rate_limits",
    "column_name": "identifier_value",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "contact_rate_limits",
    "column_name": "tenant_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "contact_rate_limits",
    "column_name": "attempt_count",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": "1"
  },
  {
    "table_name": "contact_rate_limits",
    "column_name": "window_start",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "contact_rate_limits",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "contact_rate_limits",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "event_images",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_name": "event_images",
    "column_name": "event_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "event_images",
    "column_name": "storage_path",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "event_images",
    "column_name": "filename",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "event_images",
    "column_name": "position",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": "0"
  },
  {
    "table_name": "event_images",
    "column_name": "is_cover",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "false"
  },
  {
    "table_name": "event_images",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "events",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_name": "events",
    "column_name": "tenant_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "events",
    "column_name": "title",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "events",
    "column_name": "description",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "events",
    "column_name": "starts_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "events",
    "column_name": "ends_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "events",
    "column_name": "status",
    "data_type": "USER-DEFINED",
    "is_nullable": "NO",
    "column_default": "'draft'::event_status"
  },
  {
    "table_name": "events",
    "column_name": "created_by",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "events",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_name": "events",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_name": "events",
    "column_name": "slug",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "events",
    "column_name": "map_center_lat",
    "data_type": "double precision",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "events",
    "column_name": "map_center_lng",
    "data_type": "double precision",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "events",
    "column_name": "map_center_address",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "events",
    "column_name": "boundary_radius_meters",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "events",
    "column_name": "preview_token",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "events",
    "column_name": "spot_term_singular",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": "'Spot'::text"
  },
  {
    "table_name": "events",
    "column_name": "spot_term_plural",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": "'Spots'::text"
  },
  {
    "table_name": "geocoding_requests",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_name": "geocoding_requests",
    "column_name": "tenant_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "geocoding_requests",
    "column_name": "spot_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "geocoding_requests",
    "column_name": "provider",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "geocoding_requests",
    "column_name": "query_text",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "geocoding_requests",
    "column_name": "result_lat",
    "data_type": "double precision",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "geocoding_requests",
    "column_name": "result_lng",
    "data_type": "double precision",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "geocoding_requests",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_name": "geocoding_requests",
    "column_name": "created_by",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "memberships",
    "column_name": "tenant_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "memberships",
    "column_name": "user_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "memberships",
    "column_name": "role",
    "data_type": "USER-DEFINED",
    "is_nullable": "NO",
    "column_default": "'member'::app_role"
  },
  {
    "table_name": "memberships",
    "column_name": "status",
    "data_type": "USER-DEFINED",
    "is_nullable": "NO",
    "column_default": "'active'::membership_status"
  },
  {
    "table_name": "memberships",
    "column_name": "invited_email",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "memberships",
    "column_name": "invite_token",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "memberships",
    "column_name": "invite_expires_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "memberships",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_name": "profiles",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "profiles",
    "column_name": "email",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "profiles",
    "column_name": "display_name",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "profiles",
    "column_name": "consent_version",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "profiles",
    "column_name": "consent_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "profiles",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_name": "profiles",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_name": "profiles",
    "column_name": "notification_preferences",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": "'{\"contact_form_emails\": true}'::jsonb"
  },
  {
    "table_name": "spot_deletion_requests",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_name": "spot_deletion_requests",
    "column_name": "spot_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "spot_deletion_requests",
    "column_name": "tenant_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "spot_deletion_requests",
    "column_name": "event_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "spot_deletion_requests",
    "column_name": "status",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": "'pending'::text"
  },
  {
    "table_name": "spot_deletion_requests",
    "column_name": "requester_reason",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "spot_deletion_requests",
    "column_name": "requester_name",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "spot_deletion_requests",
    "column_name": "requester_email",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "spot_deletion_requests",
    "column_name": "requester_address",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "spot_deletion_requests",
    "column_name": "reviewed_by",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "spot_deletion_requests",
    "column_name": "reviewed_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "spot_deletion_requests",
    "column_name": "reviewer_note",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "spot_deletion_requests",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "spot_deletion_requests",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "spots",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_name": "spots",
    "column_name": "tenant_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  }
]

## Foreign Key Beziehungen

[
  {
    "table_name": "memberships",
    "column_name": "tenant_id",
    "foreign_table_name": "tenants",
    "foreign_column_name": "id"
  },
  {
    "table_name": "memberships",
    "column_name": "user_id",
    "foreign_table_name": "profiles",
    "foreign_column_name": "id"
  },
  {
    "table_name": "events",
    "column_name": "tenant_id",
    "foreign_table_name": "tenants",
    "foreign_column_name": "id"
  },
  {
    "table_name": "events",
    "column_name": "created_by",
    "foreign_table_name": "profiles",
    "foreign_column_name": "id"
  },
  {
    "table_name": "spots",
    "column_name": "tenant_id",
    "foreign_table_name": "tenants",
    "foreign_column_name": "id"
  },
  {
    "table_name": "spots",
    "column_name": "event_id",
    "foreign_table_name": "events",
    "foreign_column_name": "id"
  },
  {
    "table_name": "spots",
    "column_name": "created_by",
    "foreign_table_name": "profiles",
    "foreign_column_name": "id"
  },
  {
    "table_name": "geocoding_requests",
    "column_name": "tenant_id",
    "foreign_table_name": "tenants",
    "foreign_column_name": "id"
  },
  {
    "table_name": "geocoding_requests",
    "column_name": "spot_id",
    "foreign_table_name": "spots",
    "foreign_column_name": "id"
  },
  {
    "table_name": "geocoding_requests",
    "column_name": "created_by",
    "foreign_table_name": "profiles",
    "foreign_column_name": "id"
  },
  {
    "table_name": "consents",
    "column_name": "tenant_id",
    "foreign_table_name": "tenants",
    "foreign_column_name": "id"
  },
  {
    "table_name": "consents",
    "column_name": "granted_by",
    "foreign_table_name": "profiles",
    "foreign_column_name": "id"
  },
  {
    "table_name": "tenants",
    "column_name": "created_by",
    "foreign_table_name": "profiles",
    "foreign_column_name": "id"
  },
  {
    "table_name": "spot_deletion_requests",
    "column_name": "spot_id",
    "foreign_table_name": "spots",
    "foreign_column_name": "id"
  },
  {
    "table_name": "spot_deletion_requests",
    "column_name": "tenant_id",
    "foreign_table_name": "tenants",
    "foreign_column_name": "id"
  },
  {
    "table_name": "spot_deletion_requests",
    "column_name": "event_id",
    "foreign_table_name": "events",
    "foreign_column_name": "id"
  },
  {
    "table_name": "spot_deletion_requests",
    "column_name": "reviewed_by",
    "foreign_table_name": "profiles",
    "foreign_column_name": "id"
  },
  {
    "table_name": "contact_messages",
    "column_name": "tenant_id",
    "foreign_table_name": "tenants",
    "foreign_column_name": "id"
  },
  {
    "table_name": "contact_messages",
    "column_name": "event_id",
    "foreign_table_name": "events",
    "foreign_column_name": "id"
  },
  {
    "table_name": "contact_rate_limits",
    "column_name": "tenant_id",
    "foreign_table_name": "tenants",
    "foreign_column_name": "id"
  },
  {
    "table_name": "event_images",
    "column_name": "event_id",
    "foreign_table_name": "events",
    "foreign_column_name": "id"
  }
]