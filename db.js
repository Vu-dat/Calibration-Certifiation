require('dotenv').config({ override: true });
const postgres = require('postgres');

const SUPABASE_HOST = process.env.SUPABASE_HOST;
const SUPABASE_PORT = parseInt(process.env.SUPABASE_PORT || '6543', 10);
const SUPABASE_DB   = process.env.SUPABASE_DB || 'postgres';
const SUPABASE_USER = process.env.SUPABASE_USER;
const SUPABASE_PASSWORD = process.env.SUPABASE_PASSWORD;
const SUPABASE_SSL  = process.env.SUPABASE_SSL || 'require';

if (!SUPABASE_HOST || !SUPABASE_USER || !SUPABASE_PASSWORD) {
  console.error('❌ Missing required environment variables: SUPABASE_HOST, SUPABASE_USER, SUPABASE_PASSWORD');
  console.error('   Copy .env.example to .env and fill in your Supabase credentials.');
  process.exit(1);
}

const sql = postgres({
  host: SUPABASE_HOST,
  port: SUPABASE_PORT,
  database: SUPABASE_DB,
  username: SUPABASE_USER,
  password: SUPABASE_PASSWORD,
  ssl: SUPABASE_SSL,
  prepare: true,
  max: 10,
  idle_timeout: 30,
  connect_timeout: 15,
});

module.exports = sql;
