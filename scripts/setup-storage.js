const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupStorage() {
  console.log('Checking for "resources" bucket...');
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error('Error listing buckets:', listError.message);
    process.exit(1);
  }

  const exists = buckets.find(b => b.name === 'resources');
  
  if (exists) {
    console.log('Bucket "resources" already exists.');
  } else {
    console.log('Creating "resources" bucket...');
    const { data, error } = await supabase.storage.createBucket('resources', {
      public: true,
      allowedMimeTypes: ['application/pdf'],
      fileSizeLimit: 10485760 // 10MB
    });
    
    if (error) {
      console.error('Error creating bucket:', error.message);
    } else {
      console.log('Bucket "resources" created successfully!');
    }
  }
}

setupStorage();
