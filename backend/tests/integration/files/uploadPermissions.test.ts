import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';

import { createApp } from '../../../src/app';
import { resetDb } from '../../helpers/testDb';
import { createTestJwt } from '../../helpers/testAuth';
import { pool } from '../../../src/db/client';

describe('file upload permissions', () => {
  const app = createApp();

  beforeEach(async () => {
    await resetDb();
  });

  it('Technician cannot initiate upload; SeniorTechnician can', async () => {
    const { rows } = await pool.query<{ job_id: string }>(
      `insert into jobs (reference, name, start_date, end_date, location, status)
       values ('REF-F2','Job Files','2026-01-01','2026-01-02','London','Draft') returning job_id`,
    );
    const jobId = rows[0]!.job_id;

    await pool.query(`insert into users (user_id) values ('tech-1') on conflict do nothing`);
    await pool.query(`insert into users (user_id) values ('st-1') on conflict do nothing`);
    await pool.query(
      `insert into job_role_assignments (job_id, user_id, role) values ($1, $2, 'Technician')`,
      [jobId, 'tech-1'],
    );
    await pool.query(
      `insert into job_role_assignments (job_id, user_id, role) values ($1, $2, 'SeniorTechnician')`,
      [jobId, 'st-1'],
    );

    const techToken = await createTestJwt({ sub: 'tech-1', role: 'Technician' });
    const stToken = await createTestJwt({ sub: 'st-1', role: 'SeniorTechnician' });

    const forbidden = await request(app)
      .post(`/api/v1/jobs/${jobId}/files/initiate-upload`)
      .set('authorization', `Bearer ${techToken}`)
      .send({
        area: 'Shared',
        category: 'General',
        originalFileName: 'a.txt',
        mimeType: 'text/plain',
        sizeBytes: 1,
      });
    expect(forbidden.status).toBe(403);

    const ok = await request(app)
      .post(`/api/v1/jobs/${jobId}/files/initiate-upload`)
      .set('authorization', `Bearer ${stToken}`)
      .send({
        area: 'Shared',
        category: 'General',
        originalFileName: 'a.txt',
        mimeType: 'text/plain',
        sizeBytes: 1,
      });

    if (ok.status >= 500) {
      throw new Error(`Unexpected ${ok.status}: body=${JSON.stringify(ok.body)} text=${ok.text}`);
    }
    expect(ok.status).toBe(200);
    expect(ok.body.file.originalFileName).toBe('a.txt');
    expect(ok.body.upload.url).toContain('/api/v1/files/upload');
  });
});

