import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';

import { createApp } from '../../../src/app';
import { resetDb } from '../../helpers/testDb';
import { createTestJwt } from '../../helpers/testAuth';
import { pool } from '../../../src/db/client';

describe('plug-up permissions', () => {
  const app = createApp();

  beforeEach(async () => {
    await resetDb();
  });

  it('Technician with job access can view + edit plug-up sheet', async () => {
    const { rows } = await pool.query<{ job_id: string }>(
      `insert into jobs (reference, name, start_date, end_date, location, status)
       values ('REF-P1','Paperwork','2026-01-01','2026-01-02','London','Draft') returning job_id`,
    );
    const jobId = rows[0]!.job_id;

    await pool.query(`insert into users (user_id) values ('tech-1') on conflict do nothing`);
    await pool.query(
      `insert into job_role_assignments (job_id, user_id, role) values ($1, $2, 'Technician')`,
      [jobId, 'tech-1'],
    );

    const token = await createTestJwt({ sub: 'tech-1', role: 'Technician' });

    const getRes = await request(app)
      .get(`/api/v1/jobs/${jobId}/paperwork/plugup`)
      .set('authorization', `Bearer ${token}`);
    expect(getRes.status).toBe(200);

    const putRes = await request(app)
      .patch(`/api/v1/jobs/${jobId}/paperwork/plugup`)
      .set('authorization', `Bearer ${token}`)
      .send({
        rows: [
          { orderIndex: 0, label: 'A', value: '1' },
          { orderIndex: 1, label: 'B', value: '2' },
        ],
      });
    expect(putRes.status).toBe(200);
    expect(putRes.body.sheet.rows).toHaveLength(2);
  });

  it('unassigned user cannot view plug-up sheet', async () => {
    const { rows } = await pool.query<{ job_id: string }>(
      `insert into jobs (reference, name, start_date, end_date, location, status)
       values ('REF-P2','Paperwork 2','2026-01-01','2026-01-02','London','Draft') returning job_id`,
    );
    const jobId = rows[0]!.job_id;

    const token = await createTestJwt({ sub: 'random-1', role: 'Technician' });

    const res = await request(app)
      .get(`/api/v1/jobs/${jobId}/paperwork/plugup`)
      .set('authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});

