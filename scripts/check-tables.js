require('dotenv').config({ path: '.env.local' });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data, error } = await supabase.from('resources').select('id').limit(1);
  if (error) {
    console.log('Error or table missing:', error.message);
    process.exit(1);
  } else {
    console.log('Table "resources" exists!');
  }
}

check();
