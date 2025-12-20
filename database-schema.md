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
  },
  {
    "table_name": "spots",
    "column_name": "event_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "spots",
    "column_name": "title",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "spots",
    "column_name": "public_note",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "spots",
    "column_name": "internal_note",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "spots",
    "column_name": "street",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "spots",
    "column_name": "house_number",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "spots",
    "column_name": "zip",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "spots",
    "column_name": "city",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "spots",
    "column_name": "address_raw",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "spots",
    "column_name": "address_public",
    "data_type": "boolean",
    "is_nullable": "NO",
    "column_default": "false"
  },
  {
    "table_name": "spots",
    "column_name": "lat",
    "data_type": "double precision",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "spots",
    "column_name": "lng",
    "data_type": "double precision",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "spots",
    "column_name": "geo_precision",
    "data_type": "USER-DEFINED",
    "is_nullable": "NO",
    "column_default": "'exact'::geo_precision"
  },
  {
    "table_name": "spots",
    "column_name": "contact_name",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "spots",
    "column_name": "contact_email",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "spots",
    "column_name": "contact_phone",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "spots",
    "column_name": "created_by",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "spots",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_name": "spots",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "NO",
    "column_default": "now()"
  },
  {
    "table_name": "tenants",
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "table_name": "tenants",
    "column_name": "name",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "table_name": "tenants",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "table_name": "tenants",
    "column_name": "created_by",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "tenants",
    "column_name": "slug",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "table_name": "tenants",
    "column_name": "join_password",
    "data_type": "text",
    "is_nullable": "YES",
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
  }
]