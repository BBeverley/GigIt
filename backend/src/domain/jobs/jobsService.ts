import { pool } from '../../db/client';
import type { CurrentUser } from '../../auth/requestContext';
import { can } from '../auth/jobPermissions';
import { writeAuditEvent } from '../audit/auditService';

type JobRow = {
  job_id: string;
  reference: string;
  name: string;
  start_date: string;
  end_date: string;
  location: string;
  notes: string | null;
  status: 'Draft' | 'Active' | 'Archived';
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

export async function listJobs(input: {
  currentUser: CurrentUser;
  q?: string;
  status?: 'Draft' | 'Active' | 'Archived';
}) {
  const { currentUser, q, status } = input;
  const canSeeAny = can(currentUser, null, 'AnyJobVisibility');

  const params: unknown[] = [];
  const where: string[] = [];

  // Default: hide archived unless explicitly requested.
  if (status) {
    params.push(status);
    where.push(`j.status = $${params.length}`);
  } else {
    where.push(`j.status <> 'Archived'`);
  }

  if (q) {
    params.push(`%${q}%`);
    where.push(`(j.name ilike $${params.length} or j.reference ilike $${params.length})`);
  }

  let sql = `
    select j.*
    from jobs j
  `;

  if (!canSeeAny) {
    params.push(currentUser.userId);
    sql += ` join job_role_assignments a on a.job_id = j.job_id and a.user_id = $${params.length} `;
  }

  if (where.length) sql += ` where ${where.join(' and ')} `;
  sql += ' order by j.start_date desc, j.reference asc ';

  const { rows } = await pool.query<JobRow>(sql, params);
  return rows;
}

export async function getJob(input: { currentUser: CurrentUser; jobId: string }) {
  const { currentUser, jobId } = input;

  const role = await getAssignmentRole(jobId, currentUser.userId);
  if (!can(currentUser, role, 'JobRead')) return { kind: 'forbidden' as const };

  const { rows } = await pool.query<JobRow>('select * from jobs where job_id = $1', [jobId]);
  const job = rows[0];
  if (!job) return { kind: 'not_found' as const };

  return { kind: 'ok' as const, job };
}

export async function createJob(input: {
  currentUser: CurrentUser;
  job: {
    reference: string;
    name: string;
    startDate: string;
    endDate: string;
    location: string;
    notes?: string;
    status?: 'Draft' | 'Active' | 'Archived';
  };
}) {
  const { currentUser, job } = input;
  if (!can(currentUser, null, 'JobWrite')) return { kind: 'forbidden' as const };

  try {
    const { rows } = await pool.query<JobRow>(
      `
        insert into jobs (reference, name, start_date, end_date, location, notes, status)
        values ($1, $2, $3, $4, $5, $6, $7)
        returning *
      `,
      [
        job.reference,
        job.name,
        job.startDate,
        job.endDate,
        job.location,
        job.notes ?? null,
        job.status ?? 'Draft',
      ],
    );

    const created = rows[0]!;

    await writeAuditEvent({
      jobId: created.job_id,
      actorUserId: currentUser.userId,
      eventType: 'JobCreated',
      summary: `Job created: ${created.reference}`,
    });

    return { kind: 'ok' as const, job: created };
  } catch (err: unknown) {
    const pgErr = err as { code?: string } | null;
    if (pgErr?.code === '23505') {
      return { kind: 'conflict' as const, message: 'Job reference already exists' };
    }
    throw err;
  }
}

export async function updateJob(input: {
  currentUser: CurrentUser;
  jobId: string;
  patch: Partial<{
    name: string;
    startDate: string;
    endDate: string;
    location: string;
    notes: string | null;
    status: 'Draft' | 'Active' | 'Archived';
  }>;
}) {
  const { currentUser, jobId, patch } = input;

  const role = await getAssignmentRole(jobId, currentUser.userId);
  if (!can(currentUser, role, 'JobWrite')) return { kind: 'forbidden' as const };

  const sets: string[] = [];
  const params: unknown[] = [];

  function addSet(col: string, value: unknown) {
    params.push(value);
    sets.push(`${col} = $${params.length}`);
  }

  if (patch.name !== undefined) addSet('name', patch.name);
  if (patch.startDate !== undefined) addSet('start_date', patch.startDate);
  if (patch.endDate !== undefined) addSet('end_date', patch.endDate);
  if (patch.location !== undefined) addSet('location', patch.location);
  if (patch.notes !== undefined) addSet('notes', patch.notes);
  if (patch.status !== undefined) addSet('status', patch.status);

  if (sets.length === 0) return { kind: 'ok' as const, job: null };

  params.push(jobId);
  const { rows } = await pool.query<JobRow>(
    `update jobs set ${sets.join(', ')}, updated_at = now() where job_id = $${params.length} returning *`,
    params,
  );

  const updated = rows[0];
  if (!updated) return { kind: 'not_found' as const };

  await writeAuditEvent({
    jobId,
    actorUserId: currentUser.userId,
    eventType: 'JobUpdated',
    summary: `Job updated: ${updated.reference}`,
  });

  return { kind: 'ok' as const, job: updated };
}

