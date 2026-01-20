import { pgTable, text, uuid, timestamp } from 'drizzle-orm/pg-core';

export const jobNotes = pgTable('job_notes', {
  jobId: uuid('job_id').primaryKey(),
  text: text('text').notNull(),
  lastEditedByUserId: text('last_edited_by_user_id'),
  lastEditedAt: timestamp('last_edited_at', { withTimezone: true }),
});

