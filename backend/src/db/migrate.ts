import fs from 'fs';
import path from 'path';

import { pool } from './client';

const MIGRATIONS_DIR = path.join(process.cwd(), 'src', 'db', 'migrations');

async function ensureMigrationsTable() {
  await pool.query(`
    create table if not exists _migrations (
      id text primary key,
      applied_at timestamptz not null default now()
    );
  `);
}

async function appliedMigrationIds() {
  const { rows } = await pool.query<{ id: string }>('select id from _migrations');
  return new Set(rows.map((r) => r.id));
}

export async function runMigrations() {
  await ensureMigrationsTable();

  if (!fs.existsSync(MIGRATIONS_DIR)) return;

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.toLowerCase().endsWith('.sql'))
    .sort();

  const applied = await appliedMigrationIds();

  for (const file of files) {
    if (applied.has(file)) continue;

    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    await pool.query('begin');
    try {
      await pool.query(sql);
      await pool.query('insert into _migrations (id) values ($1)', [file]);
      await pool.query('commit');
    } catch (err) {
      await pool.query('rollback');
      throw err;
    }
  }
}

