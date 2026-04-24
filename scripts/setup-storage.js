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

  // 1. Resources bucket (PDFs)
  const resExists = buckets.find(b => b.name === 'resources');
  if (resExists) {
    console.log('Bucket "resources" already exists.');
  } else {
    console.log('Creating "resources" bucket...');
    const { error } = await supabase.storage.createBucket('resources', {
      public: true,
      allowedMimeTypes: ['application/pdf'],
      fileSizeLimit: 10485760 // 10MB
    });
    if (error) console.error('Error creating "resources":', error.message);
    else console.log('Bucket "resources" created successfully!');
  }

  // 2. Team bucket (Images)
  const teamExists = buckets.find(b => b.name === 'team');
  if (teamExists) {
    console.log('Bucket "team" already exists.');
  } else {
    console.log('Creating "team" bucket...');
    const { error } = await supabase.storage.createBucket('team', {
      public: true,
      allowedMimeTypes: ['image/*'],
      fileSizeLimit: 5242880 // 5MB
    });
    if (error) console.error('Error creating "team":', error.message);
    else console.log('Bucket "team" created successfully!');
  }
}

setupStorage();
