import express from 'express';

import {
  CreateJobRequestSchema,
  JobResponseSchema,
  JobsListResponseSchema,
  UpdateJobRequestSchema,
} from '@gigit/shared';
import { createJob, getJob, listJobs, updateJob } from '../domain/jobs/jobsService';
import { validate } from './middleware/validate';

export function createJobsRouter() {
  const router = express.Router();

  router.get('/', validate({ response: JobsListResponseSchema }), async (req, res, next) => {
    try {
      if (!req.currentUser) return res.status(401).json({ error: 'Unauthorized' });

      const q = typeof req.query.q === 'string' ? req.query.q : undefined;
      const rawStatus = typeof req.query.status === 'string' ? req.query.status : undefined;
      const status =
        rawStatus === 'Draft' || rawStatus === 'Active' || rawStatus === 'Archived' ? rawStatus : undefined;

      const jobs = await listJobs({ currentUser: req.currentUser, q, status });
      res.json({ jobs: jobs.map(mapJob) });
    } catch (err) {
      next(err);
    }
  });

  router.post('/', validate({ body: CreateJobRequestSchema, response: JobResponseSchema }), async (req, res, next) => {
    try {
      if (!req.currentUser) return res.status(401).json({ error: 'Unauthorized' });

      const result = await createJob({ currentUser: req.currentUser, job: req.body });
      if (result.kind === 'forbidden') return res.status(403).json({ error: 'Forbidden' });
      if (result.kind === 'conflict') return res.status(409).json({ error: 'Conflict', message: result.message });
      res.status(201).json({ job: mapJob(result.job) });
    } catch (err) {
      next(err);
    }
  });

  router.get('/:jobId', validate({ response: JobResponseSchema }), async (req, res, next) => {
    try {
      if (!req.currentUser) return res.status(401).json({ error: 'Unauthorized' });

      const jobId = req.params.jobId;
      if (!jobId) return res.status(400).json({ error: 'BadRequest' });

      const result = await getJob({ currentUser: req.currentUser, jobId });
      if (result.kind === 'forbidden') return res.status(403).json({ error: 'Forbidden' });
      if (result.kind === 'not_found') return res.status(404).json({ error: 'NotFound' });
      res.json({ job: mapJob(result.job) });
    } catch (err) {
      next(err);
    }
  });

  router.patch(
    '/:jobId',
    validate({ body: UpdateJobRequestSchema, response: JobResponseSchema }),
    async (req, res, next) => {
      try {
        if (!req.currentUser) return res.status(401).json({ error: 'Unauthorized' });

        const jobId = req.params.jobId;
        if (!jobId) return res.status(400).json({ error: 'BadRequest' });

        const result = await updateJob({ currentUser: req.currentUser, jobId, patch: req.body });
        if (result.kind === 'forbidden') return res.status(403).json({ error: 'Forbidden' });
        if (result.kind === 'not_found') return res.status(404).json({ error: 'NotFound' });

        // If no update fields were provided, fetch current state.
        if (!result.job) {
          const current = await getJob({ currentUser: req.currentUser, jobId });
          if (current.kind !== 'ok') return res.status(404).json({ error: 'NotFound' });
          return res.json({ job: mapJob(current.job) });
        }

        res.json({ job: mapJob(result.job) });
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
}

type DbJobRow = {
  job_id: string;
  reference: string;
  name: string;
  start_date: string | Date;
  end_date: string | Date;
  location: string;
  notes: string | null;
  status: string;
};

function mapJob(j: DbJobRow) {
  const startDate = toDateOnlyString(j.start_date);
  const endDate = toDateOnlyString(j.end_date);

  return {
    jobId: j.job_id,
    reference: j.reference,
    name: j.name,
    startDate,
    endDate,
    location: j.location,
    notes: j.notes ?? undefined,
    status: j.status,
  };
}

function toDateOnlyString(value: unknown) {
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}

