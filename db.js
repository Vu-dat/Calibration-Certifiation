require('dotenv').config({ override: true });
const postgres = require('postgres');

const SUPABASE_HOST = process.env.SUPABASE_HOST;
const SUPABASE_PORT = parseInt(process.env.SUPABASE_PORT || '6543', 10);
const SUPABASE_DB   = process.env.SUPABASE_DB || 'postgres';
const SUPABASE_USER = process.env.SUPABASE_USER;
const SUPABASE_PASSWORD = process.env.SUPABASE_PASSWORD;
const SUPABASE_SSL  = process.env.SUPABASE_SSL || 'require';

let sql;

if (!SUPABASE_HOST || !SUPABASE_USER || !SUPABASE_PASSWORD) {
  console.warn('⚠️ Missing required environment variables: SUPABASE_HOST, SUPABASE_USER, SUPABASE_PASSWORD');
  console.warn('   Please set these environment variables in Vercel Project Settings or your local .env file.');

  const throwConfigError = () => {
    throw new Error(
      'Database is not configured. Please set SUPABASE_HOST, SUPABASE_USER, and SUPABASE_PASSWORD in your environment variables.'
    );
  };

  sql = throwConfigError;
  sql.unsafe = throwConfigError;
} else {
  // Tối ưu cho Serverless: Giữ lại kết nối trong bộ nhớ toàn cục để tránh kết nối lại giữa các request
  if (!global._postgresSql) {
    global._postgresSql = postgres({
      host: SUPABASE_HOST,
      port: SUPABASE_PORT,
      database: SUPABASE_DB,
      username: SUPABASE_USER,
      password: SUPABASE_PASSWORD,
      ssl: { rejectUnauthorized: false },
      prepare: false,
      max: process.env.VERCEL ? 3 : 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }
  sql = global._postgresSql;
}

module.exports = sql;
