-- US3: Plug-up sheets + rows

create table if not exists plug_up_sheets (
  sheet_id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(job_id) on delete cascade,
  last_edited_by_user_id text,
  last_edited_at timestamptz,
  created_at timestamptz not null default now(),
  unique (job_id)
);

create table if not exists plug_up_rows (
  row_id uuid primary key default gen_random_uuid(),
  sheet_id uuid not null references plug_up_sheets(sheet_id) on delete cascade,
  order_index int not null,
  label text not null default '',
  value text not null default '',
  unique (sheet_id, order_index)
);

create index if not exists idx_plug_up_rows_sheet on plug_up_rows(sheet_id);

