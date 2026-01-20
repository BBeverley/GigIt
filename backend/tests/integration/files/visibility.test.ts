import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';

import { createApp } from '../../../src/app';
import { resetDb } from '../../helpers/testDb';
import { createTestJwt } from '../../helpers/testAuth';
import { pool } from '../../../src/db/client';

describe('files visibility', () => {
  const app = createApp();

  beforeEach(async () => {
    await resetDb();
  });

  it('Technician cannot list Internal files but can list Shared', async () => {
    const { rows } = await pool.query<{ job_id: string }>(
      `insert into jobs (reference, name, start_date, end_date, location, status)
       values ('REF-F1','Job Files','2026-01-01','2026-01-02','London','Draft') returning job_id`,
    );
    const jobId = rows[0]!.job_id;

    await pool.query(`insert into users (user_id) values ('tech-1') on conflict do nothing`);
    await pool.query(
      `insert into job_role_assignments (job_id, user_id, role) values ($1, $2, 'Technician')`,
      [jobId, 'tech-1'],
    );

    await pool.query(
      `insert into job_files (job_id, area, category, original_file_name, mime_type, size_bytes, storage_object_key, uploaded_by_user_id)
       values ($1,'Shared','General','shared.txt','text/plain',5,'k1','tech-1')`,
      [jobId],
    );
    await pool.query(
      `insert into job_files (job_id, area, category, original_file_name, mime_type, size_bytes, storage_object_key, uploaded_by_user_id)
       values ($1,'Internal','General','internal.txt','text/plain',5,'k2','tech-1')`,
      [jobId],
    );

    const token = await createTestJwt({ sub: 'tech-1', role: 'Technician' });

    const sharedList = await request(app)
      .get(`/api/v1/jobs/${jobId}/files`)
      .set('authorization', `Bearer ${token}`);

    if (sharedList.status >= 500) {
      throw new Error(
        `Unexpected ${sharedList.status}: body=${JSON.stringify(sharedList.body)} text=${sharedList.text}`,
      );
    }
    expect(sharedList.status).toBe(200);
    type FileDto = { area: string };
    expect((sharedList.body.files as FileDto[]).some((f) => f.area === 'Internal')).toBe(false);

    const internalList = await request(app)
      .get(`/api/v1/jobs/${jobId}/files?area=Internal`)
      .set('authorization', `Bearer ${token}`);

    if (internalList.status >= 500) {
      throw new Error(
        `Unexpected ${internalList.status}: body=${JSON.stringify(internalList.body)} text=${internalList.text}`,
      );
    }
    expect(internalList.status).toBe(403);
  });
});

