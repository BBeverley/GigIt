import { pool } from '../../db/client';
import type { CurrentUser } from '../../auth/requestContext';
import { can } from '../auth/jobPermissions';
import { writeAuditEvent } from '../audit/auditService';

type AssignmentRow = {
  assignment_id: string;
  job_id: string;
  user_id: string;
  role: string;
  assignment_notes: string | null;
  created_at: string;
  updated_at: string;
};

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

export async function listAssignments(input: { currentUser: CurrentUser; jobId: string }) {
  const { currentUser, jobId } = input;
  const role = await getAssignmentRole(jobId, currentUser.userId);
  if (!can(currentUser, role, 'JobRead')) return { kind: 'forbidden' as const };

  const { rows } = await pool.query<AssignmentRow>(
    'select * from job_role_assignments where job_id = $1 order by created_at asc',
    [jobId],
  );
  return { kind: 'ok' as const, assignments: rows };
}

export async function createAssignment(input: {
  currentUser: CurrentUser;
  jobId: string;
  userId: string;
  role: string;
  assignmentNotes?: string;
}) {
  const { currentUser, jobId, userId, role: newRole, assignmentNotes } = input;
  const role = await getAssignmentRole(jobId, currentUser.userId);
  if (!can(currentUser, role, 'AssignmentsWrite')) return { kind: 'forbidden' as const };

  const { rows } = await pool.query<AssignmentRow>(
    `
      insert into job_role_assignments (job_id, user_id, role, assignment_notes)
      values ($1, $2, $3, $4)
      returning *
    `,
    [jobId, userId, newRole, assignmentNotes ?? null],
  );

  await writeAuditEvent({
    jobId,
    actorUserId: currentUser.userId,
    eventType: 'AssignmentChanged',
    summary: `Assignment added: ${userId} (${newRole})`,
  });

  return { kind: 'ok' as const, assignment: rows[0]! };
}

export async function updateAssignment(input: {
  currentUser: CurrentUser;
  jobId: string;
  assignmentId: string;
  patch: Partial<{ role: string; assignmentNotes: string | null }>;
}) {
  const { currentUser, jobId, assignmentId, patch } = input;
  const role = await getAssignmentRole(jobId, currentUser.userId);
  if (!can(currentUser, role, 'AssignmentsWrite')) return { kind: 'forbidden' as const };

  const sets: string[] = [];
  const params: unknown[] = [];

  if (patch.role !== undefined) {
    params.push(patch.role);
    sets.push(`role = $${params.length}`);
  }
  if (patch.assignmentNotes !== undefined) {
    params.push(patch.assignmentNotes);
    sets.push(`assignment_notes = $${params.length}`);
  }

  if (sets.length === 0) return { kind: 'ok' as const, assignment: null };

  params.push(jobId);
  params.push(assignmentId);

  const { rows } = await pool.query<AssignmentRow>(
    `
      update job_role_assignments
      set ${sets.join(', ')}, updated_at = now()
      where job_id = $${params.length - 1} and assignment_id = $${params.length}
      returning *
    `,
    params,
  );

  const updated = rows[0];
  if (!updated) return { kind: 'not_found' as const };

  await writeAuditEvent({
    jobId,
    actorUserId: currentUser.userId,
    eventType: 'AssignmentChanged',
    summary: `Assignment updated: ${updated.user_id}`,
  });

  return { kind: 'ok' as const, assignment: updated };
}

export async function deleteAssignment(input: {
  currentUser: CurrentUser;
  jobId: string;
  assignmentId: string;
}) {
  const { currentUser, jobId, assignmentId } = input;
  const role = await getAssignmentRole(jobId, currentUser.userId);
  if (!can(currentUser, role, 'AssignmentsWrite')) return { kind: 'forbidden' as const };

  const { rows } = await pool.query<{ user_id: string }>(
    'delete from job_role_assignments where job_id = $1 and assignment_id = $2 returning user_id',
    [jobId, assignmentId],
  );

  if (!rows[0]) return { kind: 'not_found' as const };

  await writeAuditEvent({
    jobId,
    actorUserId: currentUser.userId,
    eventType: 'AssignmentChanged',
    summary: `Assignment removed: ${rows[0].user_id}`,
  });

  return { kind: 'ok' as const };
}

