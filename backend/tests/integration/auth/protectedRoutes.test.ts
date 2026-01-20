import { describe, expect, it } from 'vitest';
import request from 'supertest';

import { createApp } from '../../../src/app';

describe('protected routes', () => {
  it('returns 401 without token', async () => {
    const app = createApp();
    const res = await request(app).get('/api/v1/protected');
    expect(res.status).toBe(401);
  });
});

