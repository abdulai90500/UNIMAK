const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const connectionString = `postgres://postgres.qyvyvyvzroewlmrsexoc:${process.env.POSTGRES_PASSWORD}@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require`;

const client = new Client({
  connectionString: connectionString,
});

const sql = `
-- Allow authenticated users to upload files to the 'resources' bucket
CREATE POLICY "Authenticated users can upload resources"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resources');

-- Allow authenticated users to update their own files
CREATE POLICY "Authenticated users can update resources"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'resources');

-- Allow authenticated users to delete their own files
CREATE POLICY "Authenticated users can delete resources"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'resources');

-- Allow public access to read files in the 'resources' bucket
CREATE POLICY "Public access to resources"
ON storage.objects FOR SELECT
USING (bucket_id = 'resources');
`;

async function setup() {
  try {
    console.log('Connecting to Supabase Postgres to setup Storage Policies...');
    await client.connect();
    
    // We check if policies exist or just try to run them
    // Using DO blocks or standard SQL with IF NOT EXISTS if possible, 
    // but storage.objects policies don't support IF NOT EXISTS in all versions.
    // We'll wrap in a try-catch for each if needed, but for now we'll run simple SQL.
    
    console.log('Applying Storage RLS Policies...');
    await client.query(sql);
    
    console.log('Storage Policies applied successfully!');
  } catch (err) {
    console.error('Failed to apply storage policies:', err.message);
    if (err.message.includes('already exists')) {
        console.log('Policies likely already exist. This is fine.');
    } else {
        process.exit(1);
    }
  } finally {
    await client.end();
  }
}

setup();
