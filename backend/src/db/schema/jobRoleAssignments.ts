import { pgTable, text, uuid, timestamp } from 'drizzle-orm/pg-core';

export const jobRoleAssignments = pgTable('job_role_assignments', {
  assignmentId: uuid('assignment_id').primaryKey(),
  jobId: uuid('job_id').notNull(),
  userId: text('user_id').notNull(),
  role: text('role').notNull(),
  assignmentNotes: text('assignment_notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
});

