const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const connectionString = `postgres://postgres.qyvyvyvzroewlmrsexoc:${process.env.POSTGRES_PASSWORD}@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require`;

const client = new Client({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function deploy() {
  try {
    console.log('Connecting to Supabase Postgres...');
    await client.connect();
    console.log('Connected successfully!');

    const sqlPath = path.join(__dirname, '..', 'supabase', 'schema.sql');
    console.log(`Reading schema from ${sqlPath}...`);
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing SQL schema...');
    // We split by standard SQL statement separator if possible, but pg client can handle multiple statements in one query if not using parameters
    await client.query(sql);
    
    console.log('Database schema deployed successfully!');
  } catch (err) {
    console.error('Deployment failed:', err.message);
    if (err.detail) console.error('Detail:', err.detail);
    process.exit(1);
  } finally {
    await client.end();
  }
}

deploy();
