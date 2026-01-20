import { pool } from '../../db/client';
import type { CurrentUser } from '../../auth/requestContext';
import { can } from '../auth/jobPermissions';

export type FileArea = 'Shared' | 'Internal';

type FileRow = {
  file_id: string;
  job_id: string;
  area: FileArea;
  category: string;
  original_file_name: string;
  mime_type: string;
  size_bytes: number;
  storage_object_key: string;
  uploaded_by_user_id: string;
  uploaded_at: string;
  deleted_at: string | null;
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

export async function listJobFiles(input: {
  currentUser: CurrentUser;
  jobId: string;
  area?: FileArea;
  category?: string;
}) {
  const { currentUser, jobId, area, category } = input;
  const role = await getAssignmentRole(jobId, currentUser.userId);

  if (!can(currentUser, role, 'JobRead')) return { kind: 'forbidden' as const };

  // Apply internal visibility rule.
  const canSeeInternal = can(currentUser, role, 'FilesReadInternal');

  if (area === 'Internal' && !canSeeInternal) return { kind: 'forbidden' as const };

  const where: string[] = ['job_id = $1', 'deleted_at is null'];
  const params: unknown[] = [jobId];

  if (area) {
    params.push(area);
    where.push(`area = $${params.length}`);
  } else if (!canSeeInternal) {
    where.push(`area = 'Shared'`);
  }

  if (category) {
    params.push(category);
    where.push(`category = $${params.length}`);
  }

  const { rows } = await pool.query<FileRow>(
    `select * from job_files where ${where.join(' and ')} order by uploaded_at desc`,
    params,
  );
  return { kind: 'ok' as const, files: rows };
}

export async function getJobFile(input: { currentUser: CurrentUser; jobId: string; fileId: string }) {
  const { currentUser, jobId, fileId } = input;
  const role = await getAssignmentRole(jobId, currentUser.userId);
  if (!can(currentUser, role, 'JobRead')) return { kind: 'forbidden' as const };

  const { rows } = await pool.query<FileRow>(
    'select * from job_files where job_id = $1 and file_id = $2 and deleted_at is null',
    [jobId, fileId],
  );
  const file = rows[0];
  if (!file) return { kind: 'not_found' as const };

  if (file.area === 'Internal' && !can(currentUser, role, 'FilesReadInternal'))
    return { kind: 'forbidden' as const };

  return { kind: 'ok' as const, file };
}

export async function createFileMetadata(input: {
  currentUser: CurrentUser;
  jobId: string;
  area: FileArea;
  category: string;
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
  storageObjectKey: string;
}) {
  const { currentUser, jobId } = input;
  const role = await getAssignmentRole(jobId, currentUser.userId);
  if (!can(currentUser, role, 'FilesUpload')) return { kind: 'forbidden' as const };

  const { rows } = await pool.query<FileRow>(
    `
      insert into job_files
        (job_id, area, category, original_file_name, mime_type, size_bytes, storage_object_key, uploaded_by_user_id)
      values
        ($1,$2,$3,$4,$5,$6,$7,$8)
      returning *
    `,
    [
      input.jobId,
      input.area,
      input.category,
      input.originalFileName,
      input.mimeType,
      input.sizeBytes,
      input.storageObjectKey,
      currentUser.userId,
    ],
  );

  return { kind: 'ok' as const, file: rows[0]! };
}

export async function softDeleteFile(input: { currentUser: CurrentUser; jobId: string; fileId: string }) {
  const { currentUser, jobId, fileId } = input;
  const role = await getAssignmentRole(jobId, currentUser.userId);
  if (!can(currentUser, role, 'FilesDelete')) return { kind: 'forbidden' as const };

  const { rows } = await pool.query<FileRow>(
    `
      update job_files
      set deleted_at = now()
      where job_id = $1 and file_id = $2 and deleted_at is null
      returning *
    `,
    [jobId, fileId],
  );

  const file = rows[0];
  if (!file) return { kind: 'not_found' as const };
  return { kind: 'ok' as const, file };
}

