import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    // Integration tests in this repo currently share a single local Postgres instance
    // and perform destructive resets; therefore we must not run files in parallel.
    fileParallelism: false,
    sequence: {
      concurrent: false,
    },
    poolOptions: {
      threads: {
        minThreads: 1,
        maxThreads: 1,
      },
    },
  },
  resolve: {
    alias: {
      '@gigit/shared': path.resolve(__dirname, '../packages/shared/src/index.ts'),
    },
  },
});

