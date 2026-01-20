import { pgTable, text, uuid, date, timestamp } from 'drizzle-orm/pg-core';

export const jobs = pgTable('jobs', {
  jobId: uuid('job_id').primaryKey(),
  reference: text('reference').notNull(),
  name: text('name').notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  location: text('location').notNull(),
  notes: text('notes'),
  status: text('status').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
});

