const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load .env.test file
dotenv.config({ path: '.env.test' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

(async () => {
  console.log('Checking test user status...\n');

  const { data: users } = await supabase.auth.admin.listUsers();
  const testUser = users?.users.find(u => u.email === process.env.TEST_ORGANIZER_EMAIL);

  if (testUser) {
    console.log('✓ Test User Found:');
    console.log('  Email:', testUser.email);
    console.log('  Email Confirmed:', testUser.email_confirmed_at ? '✓ YES' : '✗ NO');
    console.log('  Confirmed At:', testUser.email_confirmed_at || 'Not confirmed');
    console.log('  Created At:', testUser.created_at);
    console.log('  Last Sign In:', testUser.last_sign_in_at || 'Never');
    console.log('  User ID:', testUser.id);

    // Check profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', testUser.id)
      .maybeSingle();

    console.log('\n✓ Profile:');
    if (profile) {
      console.log('  Display Name:', profile.display_name || 'Not set');
      console.log('  Email:', profile.email);
    } else {
      console.log('  ✗ No profile found');
    }

    // Check memberships
    const { data: memberships } = await supabase
      .from('memberships')
      .select('*, tenants(name, slug)')
      .eq('user_id', testUser.id);

    console.log('\n✓ Memberships:', memberships?.length || 0);
    if (memberships && memberships.length > 0) {
      memberships.forEach((m, i) => {
        console.log(`  ${i + 1}. ${m.tenants?.name} (${m.tenants?.slug}) - Role: ${m.role}`);
      });
    }

  } else {
    console.log('✗ Test user not found!');
    console.log('  Expected email:', process.env.TEST_ORGANIZER_EMAIL);
    console.log('\nYou need to create this user first.');
  }
})();
