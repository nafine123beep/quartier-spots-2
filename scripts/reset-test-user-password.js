const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load .env.test file
dotenv.config({ path: '.env.test' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

(async () => {
  console.log('Resetting password for test user...\n');

  const { data: users } = await supabase.auth.admin.listUsers();
  const testUser = users?.users.find(u => u.email === process.env.TEST_ORGANIZER_EMAIL);

  if (!testUser) {
    console.log('❌ Test user not found!');
    console.log('Email:', process.env.TEST_ORGANIZER_EMAIL);
    process.exit(1);
  }

  console.log('Found user:', testUser.email);
  console.log('User ID:', testUser.id);
  console.log('');

  // Update user password using admin API
  const { data, error } = await supabase.auth.admin.updateUserById(
    testUser.id,
    { password: process.env.TEST_PASSWORD }
  );

  if (error) {
    console.log('❌ Password reset FAILED:');
    console.log('Error:', error.message);
    process.exit(1);
  }

  console.log('✅ Password reset SUCCESSFUL!');
  console.log('');
  console.log('You can now log in with:');
  console.log('  Email:', process.env.TEST_ORGANIZER_EMAIL);
  console.log('  Password:', process.env.TEST_PASSWORD);
  console.log('');
  console.log('Testing login...');

  // Test the login
  const supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data: loginData, error: loginError } = await supabaseClient.auth.signInWithPassword({
    email: process.env.TEST_ORGANIZER_EMAIL,
    password: process.env.TEST_PASSWORD
  });

  if (loginError) {
    console.log('❌ Login test FAILED:', loginError.message);
  } else {
    console.log('✅ Login test SUCCESSFUL!');
  }
})();
