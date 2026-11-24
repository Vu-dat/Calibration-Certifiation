'use strict';

require('dotenv').config();
const postgres = require('postgres');

// Vercel integrations commonly expose a complete PostgreSQL URL, while local
// development in this project uses the individual SUPABASE_* variables.
const connectionUrl = [
  process.env.SUPABASE_DB_URL,
  process.env.DATABASE_URL,
  process.env.POSTGRES_URL,
  process.env.POSTGRES_PRISMA_URL,
].map(value => typeof value === 'string'
  ? value.trim().replace(/^(['"])(.*)\1$/, '$2').trim()
  : '')
  .find(Boolean);

function sslOption() {
  const ca = process.env.SUPABASE_DB_CA
    ? process.env.SUPABASE_DB_CA.replace(/\\n/g, '\n').trim()
    : undefined;
  const mode = (process.env.SUPABASE_SSL || 'require').toLowerCase();
  if (mode === 'disable' || mode === 'false' || mode === '0') return false;
  if (ca) return { rejectUnauthorized: true, ca };
  // Supabase's managed PostgreSQL certificates are trusted by the platform,
  // but some deployments do not provide a CA bundle to the function.
  return { rejectUnauthorized: false };
}

let sql = global._postgresSql;
if (!sql) {
  const options = {
    ssl: sslOption(),
    prepare: false,
    max: process.env.VERCEL ? 5 : 10,
    idle_timeout: 20,
    connect_timeout: Number(process.env.SUPABASE_CONNECT_TIMEOUT || 10),
  };

  if (connectionUrl) {
    try {
      const parsed = new URL(connectionUrl);
      if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) {
        throw new Error('expected a postgres:// or postgresql:// URL');
      }
      // Supabase connection pooler URLs often use sslmode=require. Keep TLS
      // enabled regardless of URL query parameters unless explicitly disabled.
      options.host = parsed.hostname;
      options.port = Number(parsed.port || 5432);
      options.database = decodeURIComponent(parsed.pathname.replace(/^\//, '')) || 'postgres';
      options.username = decodeURIComponent(parsed.username);
      options.password = decodeURIComponent(parsed.password);
      if (parsed.searchParams.get('sslmode') === 'disable') options.ssl = false;
    } catch (error) {
      throw new Error(`Invalid PostgreSQL connection URL: ${error.message}`);
    }
  } else {
    const host = process.env.SUPABASE_HOST;
    const user = process.env.SUPABASE_USER;
    const password = process.env.SUPABASE_PASSWORD;
    if (!host || !user || !password) {
      const missing = [
        !host && 'SUPABASE_HOST (or a database URL)',
        !user && 'SUPABASE_USER (or a database URL)',
        !password && 'SUPABASE_PASSWORD (or a database URL)',
      ].filter(Boolean);
      const configurationError = new Error(`Database is not configured. Missing ${missing.join(', ')}.`);
      const fail = () => { throw configurationError; };
      sql = fail;
      sql.unsafe = fail;
    } else {
      Object.assign(options, {
        host,
        port: Number(process.env.SUPABASE_PORT || 6543),
        database: process.env.SUPABASE_DB || 'postgres',
        username: user,
        password,
      });
    }
  }

  if (!sql) {
    sql = postgres(options);
    global._postgresSql = sql;
  }
}

module.exports = sql;
