const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const connectionString = `postgres://postgres.qyvyvyvzroewlmrsexoc:${process.env.POSTGRES_PASSWORD}@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require`;

const client = new Client({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

const policies = [
  // Resources Bucket
  `DROP POLICY IF EXISTS "Authenticated users can upload resources" ON storage.objects;`,
  `CREATE POLICY "Authenticated users can upload resources" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'resources');`,
  
  `DROP POLICY IF EXISTS "Authenticated users can update resources" ON storage.objects;`,
  `CREATE POLICY "Authenticated users can update resources" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'resources');`,
  
  `DROP POLICY IF EXISTS "Authenticated users can delete resources" ON storage.objects;`,
  `CREATE POLICY "Authenticated users can delete resources" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'resources');`,
  
  `DROP POLICY IF EXISTS "Public access to resources" ON storage.objects;`,
  `CREATE POLICY "Public access to resources" ON storage.objects FOR SELECT USING (bucket_id = 'resources');`,

  // Team Bucket
  `DROP POLICY IF EXISTS "Authenticated users can upload team images" ON storage.objects;`,
  `CREATE POLICY "Authenticated users can upload team images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'team');`,
  
  `DROP POLICY IF EXISTS "Authenticated users can update team images" ON storage.objects;`,
  `CREATE POLICY "Authenticated users can update team images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'team');`,
  
  `DROP POLICY IF EXISTS "Authenticated users can delete team images" ON storage.objects;`,
  `CREATE POLICY "Authenticated users can delete team images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'team');`,
  
  `DROP POLICY IF EXISTS "Public access to team images" ON storage.objects;`,
  `CREATE POLICY "Public access to team images" ON storage.objects FOR SELECT USING (bucket_id = 'team');`
];

async function deploy() {
  try {
    console.log('Connecting to Supabase...');
    await client.connect();
    
    for (const sql of policies) {
      console.log(`Executing: ${sql.substring(0, 50)}...`);
      await client.query(sql);
    }
    
    console.log('Storage policies deployed successfully!');
  } catch (err) {
    console.error('Failed to deploy policies:', err.message);
  } finally {
    await client.end();
  }
}

deploy();
