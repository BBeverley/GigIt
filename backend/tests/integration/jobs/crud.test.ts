import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';

import { createApp } from '../../../src/app';
import { resetDb } from '../../helpers/testDb';
import { createTestJwt } from '../../helpers/testAuth';

describe('jobs CRUD permissions', () => {
  const app = createApp();

  beforeEach(async () => {
    await resetDb();
  });

  it('Admin can create a job', async () => {
    const token = await createTestJwt({ sub: 'admin-1', role: 'Admin' });

    const res = await request(app)
      .post('/api/v1/jobs')
      .set('authorization', `Bearer ${token}`)
      .send({
        reference: 'A-100',
        name: 'Arena show',
        startDate: '2026-01-01',
        endDate: '2026-01-02',
        location: 'London',
        status: 'Draft',
      });

    if (res.status >= 500) {
      throw new Error(`Unexpected ${res.status}: ${JSON.stringify(res.body)}`);
    }

    expect(res.status).toBe(201);
    expect(res.body.job.reference).toBe('A-100');
  });

  it('Technician cannot create a job', async () => {
    const token = await createTestJwt({ sub: 'tech-1', role: 'Technician' });

    const res = await request(app)
      .post('/api/v1/jobs')
      .set('authorization', `Bearer ${token}`)
      .send({
        reference: 'A-101',
        name: 'Arena show',
        startDate: '2026-01-01',
        endDate: '2026-01-02',
        location: 'London',
        status: 'Draft',
      });

    expect(res.status).toBe(403);
  });
});

