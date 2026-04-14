#!/usr/bin/env node
// Run SQL against Supabase using direct Postgres connection
// Usage: node scripts/run-sql.js <sql-file>

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const file = process.argv[2];
if (!file) {
  console.error('Usage: node scripts/run-sql.js <sql-file>');
  process.exit(1);
}

const sql = fs.readFileSync(path.resolve(file), 'utf8');

// Read .env.local for config
const envFile = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
function getEnv(key) {
  const match = envFile.match(new RegExp(`${key}=(.+)`));
  return match ? match[1].trim() : null;
}

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const dbPassword = getEnv('SUPABASE_DB_PASSWORD');
const ref = supabaseUrl.replace('https://', '').replace('.supabase.co', '');

const connectionString = `postgresql://postgres.${ref}:${encodeURIComponent(dbPassword)}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

async function run() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    const result = await client.query(sql);
    console.log('Success!', Array.isArray(result) ? `${result.length} statements executed` : 'Query complete');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
