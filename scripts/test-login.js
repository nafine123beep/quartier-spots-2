const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load .env.test file
dotenv.config({ path: '.env.test' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

(async () => {
  console.log('Testing login with test credentials...\n');
  console.log('Email:', process.env.TEST_ORGANIZER_EMAIL);
  console.log('Password:', process.env.TEST_PASSWORD);
  console.log('');

  const { data, error } = await supabase.auth.signInWithPassword({
    email: process.env.TEST_ORGANIZER_EMAIL,
    password: process.env.TEST_PASSWORD
  });

  if (error) {
    console.log('❌ Login FAILED:');
    console.log('Error:', error.message);
    console.log('');
    console.log('This means the test user either:');
    console.log('1. Does not have a password set');
    console.log('2. Has a different password than TEST_PASSWORD');
    console.log('3. Email needs to be confirmed');
  } else {
    console.log('✅ Login SUCCESSFUL!');
    console.log('User ID:', data.user?.id);
    console.log('Email:', data.user?.email);
    console.log('Email confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No');
  }
})();
