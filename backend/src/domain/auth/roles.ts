export type JobRole = 'Admin' | 'PM' | 'SeniorTechnician' | 'Technician' | 'Warehouse';

export const JOB_ROLES: JobRole[] = [
  'Admin',
  'PM',
  'SeniorTechnician',
  'Technician',
  'Warehouse',
];

export function isJobRole(value: unknown): value is JobRole {
  return typeof value === 'string' && (JOB_ROLES as readonly string[]).includes(value);
}

export type GlobalRole = 'Admin' | 'PM' | null;

// Phase 1: accept a simple JWT claim for global role.
// (Identity provider is the source of identity; business truth lives in DB.)
export function getGlobalRoleFromClaims(claims: Record<string, unknown>): GlobalRole {
  const raw = claims['role'];
  if (raw === 'Admin' || raw === 'PM') return raw;
  return null;
}

