import { pgTable, text, uuid, timestamp } from 'drizzle-orm/pg-core';

export const auditEvents = pgTable('audit_events', {
  eventId: uuid('event_id').primaryKey(),
  jobId: uuid('job_id').notNull(),
  actorUserId: text('actor_user_id').notNull(),
  eventType: text('event_type').notNull(),
  eventAt: timestamp('event_at', { withTimezone: true }).notNull(),
  summary: text('summary').notNull(),
});

