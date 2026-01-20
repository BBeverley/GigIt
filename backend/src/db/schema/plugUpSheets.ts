import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { jobs } from './jobs';

export const plugUpSheets = pgTable('plug_up_sheets', {
  sheet_id: uuid('sheet_id').primaryKey().defaultRandom(),
  job_id: uuid('job_id')
    .notNull()
    .references(() => jobs.jobId, { onDelete: 'cascade' }),
  // stored as a string for simplicity; real system would reference a user table.
  last_edited_by_user_id: text('last_edited_by_user_id'),
  last_edited_at: timestamp('last_edited_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

