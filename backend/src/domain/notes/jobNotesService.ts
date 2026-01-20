import { pool } from '../../db/client';
import type { CurrentUser } from '../../auth/requestContext';
import { can } from '../auth/jobPermissions';

async function getAssignmentRole(jobId: string, userId: string) {
  const { rows } = await pool.query<{ role: string }>(
    'select role from job_role_assignments where job_id = $1 and user_id = $2',
    [jobId, userId],
  );
  const role = rows[0]?.role;
  if (
    role === 'Admin' ||
    role === 'PM' ||
    role === 'SeniorTechnician' ||
    role === 'Technician' ||
    role === 'Warehouse'
  )
    return role;
  return null;
}

type NotesRow = {
  job_id: string;
  text: string;
  last_edited_by_user_id: string | null;
  last_edited_at: string | null;
};

export async function getNotes(input: { currentUser: CurrentUser; jobId: string }) {
  const { currentUser, jobId } = input;
  const role = await getAssignmentRole(jobId, currentUser.userId);
  if (!can(currentUser, role, 'JobRead')) return { kind: 'forbidden' as const };

  // Ensure a notes row exists for the job.
  await pool.query(
    `insert into job_notes (job_id, text) values ($1, '') on conflict (job_id) do nothing`,
    [jobId],
  );

  const { rows } = await pool.query<NotesRow>('select * from job_notes where job_id = $1', [jobId]);
  const notes = rows[0];
  if (!notes) return { kind: 'not_found' as const };
  return { kind: 'ok' as const, notes };
}

export async function updateNotes(input: { currentUser: CurrentUser; jobId: string; text: string }) {
  const { currentUser, jobId, text } = input;
  const role = await getAssignmentRole(jobId, currentUser.userId);
  if (!can(currentUser, role, 'NotesWrite')) return { kind: 'forbidden' as const };

  const { rows } = await pool.query<NotesRow>(
    `
      insert into job_notes (job_id, text, last_edited_by_user_id, last_edited_at)
      values ($1, $2, $3, now())
      on conflict (job_id) do update
      set text = excluded.text,
          last_edited_by_user_id = excluded.last_edited_by_user_id,
          last_edited_at = excluded.last_edited_at
      returning *
    `,
    [jobId, text, currentUser.userId],
  );

  return { kind: 'ok' as const, notes: rows[0]! };
}

