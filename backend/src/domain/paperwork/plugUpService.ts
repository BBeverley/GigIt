import { z } from 'zod';

import { pool } from '../../db/client';
import type { CurrentUser } from '../../auth/requestContext';
import { assertCanEditPlugUp, assertCanViewJob } from '../auth/jobPermissions';
import { writeAuditEvent } from '../audit/auditService';

export type PlugUpRowDto = {
  rowId: string;
  orderIndex: number;
  label: string;
  value: string;
};

export type PlugUpSheetDto = {
  jobId: string;
  rows: PlugUpRowDto[];
  lastEditedByUserId?: string;
  lastEditedAt?: string;
};

const PlugUpRowInputSchema = z.object({
  rowId: z.string().uuid().optional(),
  orderIndex: z.number().int().nonnegative(),
  label: z.string().optional().default(''),
  value: z.string().optional().default(''),
});

export async function getPlugUpSheet(input: {
  jobId: string;
  currentUser: CurrentUser;
}): Promise<PlugUpSheetDto> {
  await assertCanViewJob({ jobId: input.jobId, currentUser: input.currentUser });

  // Ensure a sheet exists for the job.
  const sheet = await pool.query<{
    sheet_id: string;
    last_edited_by_user_id: string | null;
    last_edited_at: Date | null;
  }>(
    `insert into plug_up_sheets (job_id) values ($1)
     on conflict (job_id) do update set job_id = excluded.job_id
     returning sheet_id, last_edited_by_user_id, last_edited_at`,
    [input.jobId],
  );
  const sheetRow = sheet.rows[0]!;

  const rowsRes = await pool.query<{
    row_id: string;
    order_index: number;
    label: string;
    value: string;
  }>(
    `select row_id, order_index, label, value
     from plug_up_rows
     where sheet_id = $1
     order by order_index asc`,
    [sheetRow.sheet_id],
  );

  return {
    jobId: input.jobId,
    rows: rowsRes.rows.map((r: { row_id: string; order_index: number; label: string; value: string }) => ({
      rowId: r.row_id,
      orderIndex: r.order_index,
      label: r.label,
      value: r.value,
    })),
    lastEditedByUserId: sheetRow.last_edited_by_user_id ?? undefined,
    lastEditedAt: sheetRow.last_edited_at ? sheetRow.last_edited_at.toISOString() : undefined,
  };
}

export async function updatePlugUpRows(input: {
  jobId: string;
  currentUser: CurrentUser;
  rows: Array<z.input<typeof PlugUpRowInputSchema>>;
}): Promise<PlugUpSheetDto> {
  await assertCanEditPlugUp({ jobId: input.jobId, currentUser: input.currentUser });

  const parsedRows = z.array(PlugUpRowInputSchema).parse(input.rows);

  // Ensure a sheet exists.
  const sheetRes = await pool.query<{ sheet_id: string }>(
    `insert into plug_up_sheets (job_id) values ($1)
     on conflict (job_id) do update set job_id = excluded.job_id
     returning sheet_id`,
    [input.jobId],
  );
  const sheetId = sheetRes.rows[0]!.sheet_id;

  await pool.query('begin');
  try {
    // Simple "last write wins": replace rows.
    await pool.query(`delete from plug_up_rows where sheet_id = $1`, [sheetId]);

    for (const r of parsedRows) {
      await pool.query(
        `insert into plug_up_rows (sheet_id, order_index, label, value)
         values ($1, $2, $3, $4)`,
        [sheetId, r.orderIndex, r.label, r.value],
      );
    }

    await pool.query(
      `update plug_up_sheets
       set last_edited_by_user_id = $1, last_edited_at = now()
       where sheet_id = $2`,
      [input.currentUser.userId, sheetId],
    );

    await pool.query('commit');
  } catch (err) {
    await pool.query('rollback');
    throw err;
  }

  await writeAuditEvent({
    jobId: input.jobId,
    actorUserId: input.currentUser.userId,
    eventType: 'PlugUpEdited',
    summary: `Plug-up updated (${parsedRows.length} rows)`,
  });

  return getPlugUpSheet({ jobId: input.jobId, currentUser: input.currentUser });
}

