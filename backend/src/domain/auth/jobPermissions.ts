import type { CurrentUser } from '../../auth/requestContext';
import { getGlobalRoleFromClaims } from './roles';

export type JobPermission =
  | 'JobRead'
  | 'JobWrite'
  | 'AssignmentsWrite'
  | 'NotesWrite'
  | 'FilesReadShared'
  | 'FilesReadInternal'
  | 'FilesUpload'
  | 'FilesDelete'
  | 'PlugUpWrite'
  | 'ActivityLogRead'
  | 'AnyJobVisibility';

type AssignmentRole = 'Admin' | 'PM' | 'SeniorTechnician' | 'Technician' | 'Warehouse' | null;

export function can(currentUser: CurrentUser, assignmentRole: AssignmentRole, perm: JobPermission) {
  const globalRole = getGlobalRoleFromClaims(currentUser.claims as Record<string, unknown>);

  if (perm === 'AnyJobVisibility') return globalRole === 'Admin' || globalRole === 'PM';

  // If the user has a global Admin/PM role, treat as full access for Phase 1.
  if (globalRole === 'Admin' || globalRole === 'PM') return true;

  if (!assignmentRole) return false;

  if (perm === 'JobRead') return true;

  if (perm === 'JobWrite') return assignmentRole === 'Admin' || assignmentRole === 'PM';

  if (perm === 'AssignmentsWrite') return assignmentRole === 'Admin' || assignmentRole === 'PM';

  if (perm === 'NotesWrite')
    return assignmentRole === 'Admin' || assignmentRole === 'PM' || assignmentRole === 'SeniorTechnician';

  if (perm === 'FilesReadShared') return true;

  if (perm === 'FilesReadInternal')
    return assignmentRole === 'Admin' || assignmentRole === 'PM' || assignmentRole === 'SeniorTechnician';

  if (perm === 'FilesUpload')
    return assignmentRole === 'Admin' || assignmentRole === 'PM' || assignmentRole === 'SeniorTechnician';

  if (perm === 'FilesDelete') return assignmentRole === 'Admin' || assignmentRole === 'PM';

  if (perm === 'PlugUpWrite') return true;

  if (perm === 'ActivityLogRead')
    return assignmentRole === 'Admin' || assignmentRole === 'PM' || assignmentRole === 'SeniorTechnician';

  return false;
}

export function canViewActivityLog(currentUser: CurrentUser) {
  const globalRole = getGlobalRoleFromClaims(currentUser.claims as Record<string, unknown>);
  return globalRole === 'Admin' || globalRole === 'PM' || globalRole === 'SeniorTechnician';
}

export async function getAssignmentRoleForUser(input: {
  jobId: string;
  userId: string;
}): Promise<AssignmentRole> {
  const { jobId, userId } = input;
  // Importing pool here would create a circular dep in some setups; keep it local.
  const { pool } = await import('../../db/client');
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

export async function assertCanViewJob(input: {
  jobId: string;
  currentUser: CurrentUser;
}) {
  const role = await getAssignmentRoleForUser({ jobId: input.jobId, userId: input.currentUser.userId });
  if (!can(input.currentUser, role, 'JobRead')) {
    const err = new Error('Forbidden');
    (err as Error & { status?: number }).status = 403;
    throw err;
  }
}

export async function assertCanEditPlugUp(input: {
  jobId: string;
  currentUser: CurrentUser;
}) {
  const role = await getAssignmentRoleForUser({ jobId: input.jobId, userId: input.currentUser.userId });
  if (!can(input.currentUser, role, 'PlugUpWrite')) {
    const err = new Error('Forbidden');
    (err as Error & { status?: number }).status = 403;
    throw err;
  }
}

