-- US2: job files

create table if not exists job_files (
  file_id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(job_id) on delete cascade,
  area text not null,
  category text not null,
  original_file_name text not null,
  mime_type text not null,
  size_bytes bigint not null,
  storage_object_key text not null,
  uploaded_by_user_id text not null references users(user_id),
  uploaded_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint job_files_area_check check (area in ('Shared', 'Internal'))
);

create index if not exists job_files_job_id_idx on job_files(job_id);
create index if not exists job_files_job_id_area_idx on job_files(job_id, area);

