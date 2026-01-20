import express from 'express';
import { JobNotesResponseSchema, UpdateJobNotesRequestSchema } from '@gigit/shared';
import { getNotes, updateNotes } from '../domain/notes/jobNotesService';
import { validate } from './middleware/validate';

export function createJobNotesRouter() {
  const router = express.Router({ mergeParams: true });

  router.get('/', validate({ response: JobNotesResponseSchema }), async (req, res, next) => {
    try {
      if (!req.currentUser) return res.status(401).json({ error: 'Unauthorized' });
      const jobId = req.params.jobId;

      const result = await getNotes({ currentUser: req.currentUser, jobId });
      if (result.kind === 'forbidden') return res.status(403).json({ error: 'Forbidden' });
      if (result.kind === 'not_found') return res.status(404).json({ error: 'NotFound' });

      res.json({
        notes: {
          jobId: result.notes.job_id,
          text: result.notes.text,
          lastEditedByUserId: result.notes.last_edited_by_user_id ?? undefined,
          lastEditedAt: result.notes.last_edited_at ?? undefined,
        },
      });
    } catch (err) {
      next(err);
    }
  });

  router.patch(
    '/',
    validate({ body: UpdateJobNotesRequestSchema, response: JobNotesResponseSchema }),
    async (req, res, next) => {
      try {
        if (!req.currentUser) return res.status(401).json({ error: 'Unauthorized' });
        const jobId = req.params.jobId;

        const result = await updateNotes({ currentUser: req.currentUser, jobId, text: req.body.text });
        if (result.kind === 'forbidden') return res.status(403).json({ error: 'Forbidden' });

        res.json({
          notes: {
            jobId: result.notes.job_id,
            text: result.notes.text,
            lastEditedByUserId: result.notes.last_edited_by_user_id ?? undefined,
            lastEditedAt: result.notes.last_edited_at ?? undefined,
          },
        });
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
}

