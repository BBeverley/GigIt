import express from 'express';

import { pool } from '../db/client';
import type { AuditEventType } from '../domain/audit/auditService';
import { canViewActivityLog } from '../domain/auth/jobPermissions';

type AuditEventRow = {
  event_id: string;
  job_id: string;
  actor_user_id: string;
  event_type: AuditEventType;
  summary: string;
  created_at: string;
};

export function createAuditEventsRouter() {
  const router = express.Router();

  router.get('/', async (req, res, next) => {
    try {
      if (!req.currentUser) return res.status(401).json({ error: 'Unauthorized' });

      if (!canViewActivityLog(req.currentUser)) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const jobId = typeof req.query.jobId === 'string' ? req.query.jobId : undefined;
      const limit =
        typeof req.query.limit === 'string' ? Math.min(200, Math.max(1, Number(req.query.limit))) : 50;

      const params: unknown[] = [];
      const where: string[] = [];
      if (jobId) {
        params.push(jobId);
        where.push(`job_id = $${params.length}`);
      }
      params.push(limit);

      const { rows } = await pool.query<AuditEventRow>(
        `select * from audit_events ${where.length ? `where ${where.join(' and ')}` : ''}
         order by created_at desc
         limit $${params.length}`,
        params,
      );

      res.json({
        events: rows.map((r: AuditEventRow) => ({
          eventId: r.event_id,
          jobId: r.job_id,
          actorUserId: r.actor_user_id,
          eventType: r.event_type,
          summary: r.summary,
          createdAt: r.created_at,
        })),
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

