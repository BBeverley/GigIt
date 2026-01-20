import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';

import { createApp } from '../../../src/app';
import { resetDb } from '../../helpers/testDb';
import { createTestJwt } from '../../helpers/testAuth';
import { pool } from '../../../src/db/client';

describe('plug-up export permissions', () => {
  const app = createApp();

  beforeEach(async () => {
    await resetDb();
  });

  it('Warehouse with job access can export PDF', async () => {
    const { rows } = await pool.query<{ job_id: string }>(
      `insert into jobs (reference, name, start_date, end_date, location, status)
       values ('REF-EX1','Export','2026-01-01','2026-01-02','London','Draft') returning job_id`,
    );
    const jobId = rows[0]!.job_id;

    await pool.query(`insert into users (user_id) values ('wh-1') on conflict do nothing`);
    await pool.query(
      `insert into job_role_assignments (job_id, user_id, role) values ($1, $2, 'Warehouse')`,
      [jobId, 'wh-1'],
    );

    const token = await createTestJwt({ sub: 'wh-1', role: 'Warehouse' });

    const res = await request(app)
      .post(`/api/v1/jobs/${jobId}/paperwork/plugup/export-pdf`)
      .set('authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.contentType).toBe('application/pdf');
    expect(typeof res.body.pdfBase64).toBe('string');
    expect(res.body.pdfBase64.length).toBeGreaterThan(10);
  });
});

