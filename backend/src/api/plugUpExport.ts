import express from 'express';

import { PlugUpExportResponseSchema } from '@gigit/shared';
import { pool } from '../db/client';
import { assertCanViewJob } from '../domain/auth/jobPermissions';
import { writeAuditEvent } from '../domain/audit/auditService';
import { getPlugUpSheet } from '../domain/paperwork/plugUpService';
import { renderSinglePagePdfFromLines } from '../exports/pdfService';
import { renderPlugUpLines } from '../exports/plugup/render';
import { validate } from './middleware/validate';

export function createPlugUpExportRouter() {
  const router = express.Router({ mergeParams: true });

  router.post('/', validate({ response: PlugUpExportResponseSchema }), async (req, res, next) => {
    try {
      if (!req.currentUser) return res.status(401).json({ error: 'Unauthorized' });
      const jobId = req.params.jobId;
      if (!jobId) return res.status(400).json({ error: 'Missing jobId' });

      await assertCanViewJob({ jobId, currentUser: req.currentUser });

      const jobRes = await pool.query<{ reference: string; name: string; start_date: string; end_date: string }>(
        'select reference, name, start_date, end_date from jobs where job_id = $1',
        [jobId],
      );
      const job = jobRes.rows[0];
      if (!job) return res.status(404).json({ error: 'NotFound' });

      const sheet = await getPlugUpSheet({ jobId, currentUser: req.currentUser });
      const lines = renderPlugUpLines({
        job: { reference: job.reference, name: job.name, startDate: job.start_date, endDate: job.end_date },
        sheet,
      });
      const pdf = renderSinglePagePdfFromLines(lines);

      await writeAuditEvent({
        jobId,
        actorUserId: req.currentUser.userId,
        eventType: 'PlugUpExported',
        summary: `Plug-up exported (${sheet.rows.length} rows)`,
      });

      res.json({
        fileName: `plugup-${job.reference}.pdf`,
        contentType: 'application/pdf',
        pdfBase64: pdf.toString('base64'),
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

