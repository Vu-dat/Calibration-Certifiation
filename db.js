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

  // Tạo hàm giả lập để tránh làm crash server khi require module, nhưng sẽ báo lỗi rõ ràng khi gọi truy vấn
  sql = throwConfigError;
  sql.unsafe = throwConfigError;
} else {
  sql = postgres({
    host: SUPABASE_HOST,
    port: SUPABASE_PORT,
    database: SUPABASE_DB,
    username: SUPABASE_USER,
    password: SUPABASE_PASSWORD,
    ssl: SUPABASE_SSL,
    prepare: false, // Vô hiệu hoá prepared statements để hỗ trợ PgBouncer/Supabase Pooler (cổng 6543/5432 pooler)
    max: 10,
    idle_timeout: 30,
    connect_timeout: 15,
  });
}

module.exports = sql;
