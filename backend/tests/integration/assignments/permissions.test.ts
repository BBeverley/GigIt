import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';

import { createApp } from '../../../src/app';
import { resetDb } from '../../helpers/testDb';
import { createTestJwt } from '../../helpers/testAuth';
import { pool } from '../../../src/db/client';
import { provisionUser } from '../../../src/domain/users/provisionUser';

describe('assignment permissions', () => {
  const app = createApp();

  beforeEach(async () => {
    await resetDb();
  });

  it('Admin can add crew assignment; Technician cannot', async () => {
    await provisionUser({ userId: 'admin-1' });
    await provisionUser({ userId: 'tech-1' });
    await provisionUser({ userId: 'user-2' });

    const { rows } = await pool.query<{ job_id: string }>(
      `insert into jobs (reference, name, start_date, end_date, location, status)
       values ('REF2','Job 2','2026-01-01','2026-01-02','London','Draft') returning job_id`,
    );
    const jobId = rows[0]!.job_id;

    // Give technician job read access via assignment (but not assignment write).
    await pool.query(
      `insert into job_role_assignments (job_id, user_id, role) values ($1, $2, $3)`,
      [jobId, 'tech-1', 'Technician'],
    );

    const adminToken = await createTestJwt({ sub: 'admin-1', role: 'Admin' });
    const techToken = await createTestJwt({ sub: 'tech-1', role: 'Technician' });

    const ok = await request(app)
      .post(`/api/v1/jobs/${jobId}/assignments`)
      .set('authorization', `Bearer ${adminToken}`)
      .send({ userId: 'user-2', role: 'Warehouse' });
    expect(ok.status).toBe(201);

    const forbidden = await request(app)
      .post(`/api/v1/jobs/${jobId}/assignments`)
      .set('authorization', `Bearer ${techToken}`)
      .send({ userId: 'user-2', role: 'Warehouse' });
    expect(forbidden.status).toBe(403);
  });
});

