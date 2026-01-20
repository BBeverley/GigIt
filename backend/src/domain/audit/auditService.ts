import { pool } from '../../db/client';

export type AuditEventType =
  | 'JobCreated'
  | 'JobUpdated'
  | 'AssignmentChanged'
  | 'FileUploaded'
  | 'FileDeleted'
  | 'PlugUpEdited'
  | 'PlugUpRowDeleted'
  | 'PlugUpExported';

export async function writeAuditEvent(input: {
  jobId: string;
  actorUserId: string;
  eventType: AuditEventType;
  summary: string;
}) {
  const { jobId, actorUserId, eventType, summary } = input;
  await pool.query(
    `
      insert into audit_events (job_id, actor_user_id, event_type, summary)
      values ($1, $2, $3, $4)
    `,
    [jobId, actorUserId, eventType, summary],
  );
}

