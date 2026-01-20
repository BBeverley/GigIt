import { describe, expect, it } from 'vitest';
import express from 'express';
import request from 'supertest';
import { z } from 'zod';

import { validate } from '../../../src/api/middleware/validate';

describe('validate middleware', () => {
  it('returns 400 for invalid body', async () => {
    const app = express();
    app.use(express.json());
    app.post(
      '/t',
      validate({ body: z.object({ n: z.number() }) }),
      (req, res) => res.json({ ok: true, n: (req.body as { n: number }).n }),
    );

    const res = await request(app).post('/t').send({ n: 'nope' });
    expect(res.status).toBe(400);
  });
});

