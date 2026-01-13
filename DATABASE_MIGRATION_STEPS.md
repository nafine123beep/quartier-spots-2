# Database Migration Steps for Test Project

Follow these steps to set up your Supabase test database:

## Step 1: Copy the SQL

The complete schema is in: `/supabase/migrations/00_complete_schema.sql`

```bash
# Open the file and copy all contents
cat supabase/migrations/00_complete_schema.sql | pbcopy  # macOS
```

Or manually open the file and copy all SQL (~300 lines).

## Step 2: Go to Your Supabase Test Project

1. Open your test project at: https://supabase.com/dashboard
2. Click on your test project
3. Click **"SQL Editor"** in the left sidebar

## Step 3: Run the Migration

1. Click **"New query"**
2. Paste the entire content from `00_complete_schema.sql`
3. Click **"Run"** (or press Cmd/Ctrl + Enter)

You should see: **"Success. No rows returned"**

This creates:
- ✅ 3 custom enum types
- ✅ 11 tables with proper relationships
- ✅ Indexes for performance
- ✅ Row Level Security (RLS) enabled
- ✅ RLS policies for access control
- ✅ Trigger for automatic profile creation

## Step 4: Create Storage Bucket

1. Click **"Storage"** in left sidebar
2. Click **"Create a new bucket"**
3. Name: `event-images`
4. Make it **Public**
5. Click **"Create bucket"**

## Step 5: Run Storage Policies

1. Go back to **SQL Editor**
2. Click **"New query"**
3. Copy content from `/supabase/migrations/20260103203613_storage_policies.sql`
4. Paste and click **"Run"**

This adds policies for:
- ✅ Public read access to event images
- ✅ Authenticated users can upload/update/delete

## Step 6: Verify Setup

Run this query in SQL Editor to check tables:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see 11 tables:
- consents
- contact_messages
- contact_rate_limits
- event_images
- events
- geocoding_requests
- memberships
- profiles
- spot_deletion_requests
- spots
- tenants

## Step 7: Create Test Users (Next Step)

Now you're ready for **Step 3** in the main testing setup guide:

1. Go to **Authentication → Users** in Supabase dashboard
2. Click **"Add user"** → **Email**
3. Create two users:
   - Email: `organizer@test.local`
   - Password: `test-password-123`
   - ✓ Confirm email

   - Email: `member@test.local`
   - Password: `test-password-123`
   - ✓ Confirm email

## Troubleshooting

### Error: "relation already exists"

If you see this error, the table already exists. You can either:
- Drop the existing tables first (dangerous if has data)
- Or skip this migration if your schema is already set up

### Error: "type already exists"

The enum types already exist. Safe to ignore or add `IF NOT EXISTS` clause.

### Error: "trigger already exists"

The trigger already exists. Safe to ignore or drop it first:
```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
```

### Storage bucket creation fails via SQL

Just create it via the UI:
1. Storage → Create bucket
2. Name: `event-images`
3. Public: Yes

## Success Checklist

- [ ] SQL migration ran without errors
- [ ] 11 tables created
- [ ] Storage bucket `event-images` exists and is public
- [ ] Storage policies applied
- [ ] Test users created
- [ ] Ready to configure `.env.test` and run tests!

---

**Next**: Return to [TESTING_SETUP_GUIDE.md](TESTING_SETUP_GUIDE.md) Step 4 to configure your `.env.test` file.
