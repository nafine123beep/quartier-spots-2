import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTestData() {
  console.log('Checking for test data in database...\n');
  
  const { data: tenants, error } = await supabase
    .from('tenants')
    .select('*')
    .like('name', 'Test Org test-%')
    .limit(10);
  
  if (error) {
    console.error('Error:', error.message);
    return;
  }
  
  console.log(`Found ${tenants.length} test tenants:`);
  tenants.forEach(t => {
    console.log(`  - ${t.name} (slug: ${t.slug})`);
  });
}

checkTestData();
