import express from 'express';

import { createHealthRouter } from './health';
import { createSignedFilesRouter } from '../files/routes';
import { requireAuth } from './middleware/auth';
import { createMeRouter } from './me';
import { createJobsRouter } from './jobs';
import { createAssignmentsRouter } from './assignments';
import { createJobNotesRouter } from './jobNotes';
import { createJobFilesRouter } from './jobFiles';
import { createPlugUpRouter } from './plugUp';
import { createPlugUpExportRouter } from './plugUpExport';
import { createAuditEventsRouter } from './auditEvents';

export function createApiRouter() {
  const router = express.Router();

  // Versioned API surface.
  router.use('/health', createHealthRouter());

  // Signed URL endpoints (local/dev). These are intentionally not auth-gated.
  router.use('/files', createSignedFilesRouter());

  // Auth required for everything else.
  router.use(requireAuth);

  router.use('/me', createMeRouter());
  router.use('/jobs', createJobsRouter());
  router.use('/jobs/:jobId/assignments', createAssignmentsRouter());
  router.use('/jobs/:jobId/notes', createJobNotesRouter());
  router.use('/jobs/:jobId/files', createJobFilesRouter());
  router.use('/jobs/:jobId/paperwork/plugup', createPlugUpRouter());
  router.use('/jobs/:jobId/paperwork/plugup/export-pdf', createPlugUpExportRouter());

  router.use('/audit-events', createAuditEventsRouter());

  // Minimal protected endpoint for auth integration tests.
  router.get('/protected', requireAuth, (_req, res) => {
    res.json({ ok: true });
  });

  return router;
}

