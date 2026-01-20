import 'dotenv/config';

import { runMigrations } from './migrate';
import { pool } from './client';

async function main() {
  await runMigrations();
}

main()
  .then(async () => {
    await pool.end();
  })
  .catch(async (err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    await pool.end();
    process.exitCode = 1;
  });

