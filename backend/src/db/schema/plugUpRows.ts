import { integer, pgTable, text, uuid } from 'drizzle-orm/pg-core';

import { plugUpSheets } from './plugUpSheets';

export const plugUpRows = pgTable('plug_up_rows', {
  row_id: uuid('row_id').primaryKey().defaultRandom(),
  sheet_id: uuid('sheet_id')
    .notNull()
    .references(() => plugUpSheets.sheet_id, { onDelete: 'cascade' }),
  order_index: integer('order_index').notNull(),
  // Keep flexible per spec; frontend can treat these as columns.
  label: text('label').notNull().default(''),
  value: text('value').notNull().default(''),
});

