import { pgTable, text, uuid, bigint, timestamp } from 'drizzle-orm/pg-core';

export const jobFiles = pgTable('job_files', {
  fileId: uuid('file_id').primaryKey(),
  jobId: uuid('job_id').notNull(),
  area: text('area').notNull(),
  category: text('category').notNull(),
  originalFileName: text('original_file_name').notNull(),
  mimeType: text('mime_type').notNull(),
  // Use bigint mode to preserve DB bigint round-tripping; map to number at API boundary.
  sizeBytes: bigint('size_bytes', { mode: 'bigint' }).notNull(),
  storageObjectKey: text('storage_object_key').notNull(),
  uploadedByUserId: text('uploaded_by_user_id').notNull(),
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }).notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

