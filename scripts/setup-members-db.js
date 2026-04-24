const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const connectionString = `postgres://postgres.qyvyvyvzroewlmrsexoc:${process.env.POSTGRES_PASSWORD}@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require`;

const client = new Client({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

const sql = `
-- Create members table
CREATE TABLE IF NOT EXISTS members (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  full_name TEXT NOT NULL,
  student_id TEXT UNIQUE NOT NULL,
  department TEXT NOT NULL,
  level TEXT NOT NULL,
  photo_url TEXT
);

-- Enable RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Authenticated can manage members" ON members;
CREATE POLICY "Authenticated can manage members"
  ON members FOR ALL
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Public can read members" ON members;
CREATE POLICY "Public can read members"
  ON members FOR SELECT
  USING (true);
`;

async function setup() {
  try {
    console.log('Connecting to Supabase...');
    await client.connect();
    console.log('Connected!');
    
    console.log('Creating members table and policies...');
    await client.query(sql);
    
    console.log('Members table setup successful!');
  } catch (err) {
    console.error('Setup failed:', err.message);
  } finally {
    await client.end();
  }
}

setup();
