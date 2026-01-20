import 'dotenv/config';

import { pool } from '../../src/db/client';
import { runMigrations } from '../../src/db/migrate';

export async function resetDb() {
  await pool.query('begin');
  try {
    await pool.query('drop schema public cascade; create schema public;');
    await pool.query('commit');
  } catch (err) {
    await pool.query('rollback');
    throw err;
  }
  await runMigrations();
}

export async function closeDb() {
  await pool.end();
}

