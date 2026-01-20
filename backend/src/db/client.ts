import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const defaultLocal = 'postgres://postgres:postgres@localhost:5432/gigit';
const connectionString =
  process.env.DATABASE_URL ??
  // Developer convenience: default to local Postgres when not in production.
  (process.env.NODE_ENV !== 'production' ? defaultLocal : undefined);

if (!connectionString) throw new Error('DATABASE_URL is required');

export const pool = new Pool({ connectionString });
export const db = drizzle(pool);

