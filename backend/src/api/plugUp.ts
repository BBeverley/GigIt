import express from 'express';

import {
  GetPlugUpResponseSchema,
  UpdatePlugUpRequestSchema,
  UpdatePlugUpResponseSchema,
} from '@gigit/shared';
import { getPlugUpSheet, updatePlugUpRows } from '../domain/paperwork/plugUpService';
import { validate } from './middleware/validate';

export function createPlugUpRouter() {
  const router = express.Router({ mergeParams: true });

  router.get('/', validate({ response: GetPlugUpResponseSchema }), async (req, res, next) => {
    try {
      if (!req.currentUser) return res.status(401).json({ error: 'Unauthorized' });

      const jobId = req.params.jobId;
      if (!jobId) return res.status(400).json({ error: 'Missing jobId' });
      const sheet = await getPlugUpSheet({
        jobId,
        currentUser: req.currentUser,
      });
      res.json({ sheet });
    } catch (err) {
      next(err);
    }
  });

  // openapi.yaml specifies PATCH; implement PATCH.
  router.patch(
    '/',
    validate({ body: UpdatePlugUpRequestSchema, response: UpdatePlugUpResponseSchema }),
    async (req, res, next) => {
      try {
        if (!req.currentUser) return res.status(401).json({ error: 'Unauthorized' });

        const jobId = req.params.jobId;
        if (!jobId) return res.status(400).json({ error: 'Missing jobId' });
        const sheet = await updatePlugUpRows({
          jobId,
          currentUser: req.currentUser,
          rows: req.body.rows,
        });
        res.json({ sheet });
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
}

