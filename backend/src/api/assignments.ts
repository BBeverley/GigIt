import express from 'express';
import {
  AssignmentResponseSchema,
  AssignmentsListResponseSchema,
  CreateAssignmentRequestSchema,
  UpdateAssignmentRequestSchema,
} from '@gigit/shared';

import {
  createAssignment,
  deleteAssignment,
  listAssignments,
  updateAssignment,
} from '../domain/assignments/assignmentsService';
import { validate } from './middleware/validate';

export function createAssignmentsRouter() {
  const router = express.Router({ mergeParams: true });

  type Params = { jobId?: string; assignmentId?: string };
  function paramsOf(req: express.Request): Params {
    return req.params as unknown as Params;
  }

  router.get('/', validate({ response: AssignmentsListResponseSchema }), async (req, res, next) => {
    try {
      if (!req.currentUser) return res.status(401).json({ error: 'Unauthorized' });
      const { jobId } = paramsOf(req);
      if (!jobId) return res.status(400).json({ error: 'BadRequest' });

      const result = await listAssignments({ currentUser: req.currentUser, jobId });
      if (result.kind === 'forbidden') return res.status(403).json({ error: 'Forbidden' });

      res.json({ assignments: result.assignments.map(mapAssignment) });
    } catch (err) {
      next(err);
    }
  });

  router.post(
    '/',
    validate({ body: CreateAssignmentRequestSchema, response: AssignmentResponseSchema }),
    async (req, res, next) => {
      try {
        if (!req.currentUser) return res.status(401).json({ error: 'Unauthorized' });
        const { jobId } = paramsOf(req);
        if (!jobId) return res.status(400).json({ error: 'BadRequest' });

        const result = await createAssignment({ currentUser: req.currentUser, jobId, ...req.body });
        if (result.kind === 'forbidden') return res.status(403).json({ error: 'Forbidden' });

        res.status(201).json({ assignment: mapAssignment(result.assignment) });
      } catch (err) {
        next(err);
      }
    },
  );

  router.patch(
    '/:assignmentId',
    validate({ body: UpdateAssignmentRequestSchema, response: AssignmentResponseSchema }),
    async (req, res, next) => {
      try {
        if (!req.currentUser) return res.status(401).json({ error: 'Unauthorized' });
        const { jobId, assignmentId } = paramsOf(req);
        if (!jobId || !assignmentId) return res.status(400).json({ error: 'BadRequest' });

        const result = await updateAssignment({
          currentUser: req.currentUser,
          jobId,
          assignmentId,
          patch: req.body,
        });
        if (result.kind === 'forbidden') return res.status(403).json({ error: 'Forbidden' });
        if (result.kind === 'not_found') return res.status(404).json({ error: 'NotFound' });

        // No-op patch.
        if (!result.assignment) return res.status(404).json({ error: 'NotFound' });

        res.json({ assignment: mapAssignment(result.assignment) });
      } catch (err) {
        next(err);
      }
    },
  );

  router.delete('/:assignmentId', async (req, res, next) => {
    try {
      if (!req.currentUser) return res.status(401).json({ error: 'Unauthorized' });
      const { jobId, assignmentId } = paramsOf(req);
      if (!jobId || !assignmentId) return res.status(400).json({ error: 'BadRequest' });

      const result = await deleteAssignment({
        currentUser: req.currentUser,
        jobId,
        assignmentId,
      });
      if (result.kind === 'forbidden') return res.status(403).json({ error: 'Forbidden' });
      if (result.kind === 'not_found') return res.status(404).json({ error: 'NotFound' });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  });

  return router;
}

type DbAssignmentRow = {
  assignment_id: string;
  job_id: string;
  user_id: string;
  role: string;
  assignment_notes: string | null;
};

function mapAssignment(a: DbAssignmentRow) {
  return {
    assignmentId: a.assignment_id,
    jobId: a.job_id,
    userId: a.user_id,
    role: a.role,
    assignmentNotes: a.assignment_notes ?? undefined,
  };
}

