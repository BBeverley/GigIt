import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';

import { createApp } from '../../../src/app';
import { resetDb } from '../../helpers/testDb';
import { createTestJwt } from '../../helpers/testAuth';
import { provisionUser } from '../../../src/domain/users/provisionUser';
import { pool } from '../../../src/db/client';

describe('jobs access boundaries', () => {
  const app = createApp();

  beforeAll(async () => {
    process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/gigit';
  });

  beforeEach(async () => {
    await resetDb();
  });

  it('unassigned user cannot access a job by id', async () => {
    // Seed users
    await provisionUser({ userId: 'admin-1', email: 'a@example.com', displayName: 'Admin' });
    await provisionUser({ userId: 'tech-1', email: 't@example.com', displayName: 'Tech' });

    // Create job directly (as admin role for API create later is covered in crud tests)
    const { rows } = await pool.query<{ job_id: string }>(
      `insert into jobs (reference, name, start_date, end_date, location, status) values
      ('REF1','Job 1','2026-01-01','2026-01-02','London','Draft') returning job_id`,
    );
    const jobId = rows[0]!.job_id;

    const techToken = await createTestJwt({ sub: 'tech-1' });

    const res = await request(app)
      .get(`/api/v1/jobs/${jobId}`)
      .set('authorization', `Bearer ${techToken}`);

    expect(res.status).toBe(403);
  });
});

