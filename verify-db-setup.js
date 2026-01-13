/**
 * Quick script to verify database setup
 * Run with: node verify-db-setup.js
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load .env.test
dotenv.config({ path: '.env.test' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.test');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifySetup() {
  console.log('🔍 Verifying Supabase test database setup...\n');

  // Check connection
  console.log('1️⃣ Checking connection...');
  const { error: connectionError } = await supabase.from('profiles').select('count').limit(0);

  if (connectionError) {
    console.log(`   ❌ Connection failed or tables don't exist`);
    console.log(`   Error: ${connectionError.message}\n`);
    console.log('   ⚠️  You need to run the database migration first!');
    console.log('   📖 See: DATABASE_MIGRATION_STEPS.md\n');
    return;
  }

  console.log('   ✅ Connection successful\n');

  // Check all required tables
  console.log('2️⃣ Checking tables...');
  const requiredTables = [
    'profiles', 'tenants', 'memberships', 'events', 'event_images',
    'spots', 'spot_deletion_requests', 'geocoding_requests',
    'contact_messages', 'contact_rate_limits', 'consents'
  ];

  for (const table of requiredTables) {
    const { error } = await supabase.from(table).select('count').limit(0);
    if (error) {
      console.log(`   ❌ Table '${table}' not found`);
    } else {
      console.log(`   ✅ Table '${table}' exists`);
    }
  }

  console.log('\n3️⃣ Checking test users...');
  const organizerEmail = process.env.TEST_ORGANIZER_EMAIL;
  const memberEmail = process.env.TEST_MEMBER_EMAIL;

  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();

  if (usersError) {
    console.log(`   ❌ Failed to list users: ${usersError.message}`);
  } else {
    const hasOrganizer = users.some(u => u.email === organizerEmail);
    const hasMember = users.some(u => u.email === memberEmail);

    if (hasOrganizer) {
      console.log(`   ✅ Organizer user exists (${organizerEmail})`);
    } else {
      console.log(`   ❌ Organizer user missing (${organizerEmail})`);
      console.log('      Create in: Authentication → Users → Add user');
    }

    if (hasMember) {
      console.log(`   ✅ Member user exists (${memberEmail})`);
    } else {
      console.log(`   ❌ Member user missing (${memberEmail})`);
      console.log('      Create in: Authentication → Users → Add user');
    }
  }

  console.log('\n4️⃣ Checking storage bucket...');
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

  if (bucketsError) {
    console.log(`   ❌ Failed to list buckets: ${bucketsError.message}`);
  } else {
    const eventImagesBucket = buckets.find(b => b.id === 'event-images');
    if (eventImagesBucket) {
      console.log(`   ✅ Storage bucket 'event-images' exists`);
      console.log(`      Public: ${eventImagesBucket.public ? 'Yes' : 'No'}`);
    } else {
      console.log(`   ❌ Storage bucket 'event-images' not found`);
      console.log('      Create in: Storage → Create bucket → Name: event-images → Public: Yes');
    }
  }

  console.log('\n📊 Summary:');
  console.log('   Next steps: See DATABASE_MIGRATION_STEPS.md');
  console.log('   Test project: ' + supabaseUrl);
}

verifySetup().catch(console.error);
