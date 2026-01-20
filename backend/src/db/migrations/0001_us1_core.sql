-- US1 core tables

create extension if not exists pgcrypto;

create table if not exists users (
  user_id text primary key,
  email text,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists jobs (
  job_id uuid primary key default gen_random_uuid(),
  reference text not null,
  name text not null,
  start_date date not null,
  end_date date not null,
  location text not null,
  notes text,
  status text not null default 'Draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint jobs_reference_unique unique (reference),
  constraint jobs_status_check check (status in ('Draft', 'Active', 'Archived'))
);

create table if not exists job_role_assignments (
  assignment_id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(job_id) on delete cascade,
  user_id text not null references users(user_id) on delete cascade,
  role text not null,
  assignment_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint job_role_assignments_unique_user_per_job unique (job_id, user_id),
  constraint job_role_assignments_role_check check (role in ('Admin','PM','SeniorTechnician','Technician','Warehouse'))
);

create table if not exists job_notes (
  job_id uuid primary key references jobs(job_id) on delete cascade,
  text text not null default '',
  last_edited_by_user_id text references users(user_id),
  last_edited_at timestamptz
);

create table if not exists audit_events (
  event_id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(job_id) on delete cascade,
  actor_user_id text not null references users(user_id),
  event_type text not null,
  event_at timestamptz not null default now(),
  summary text not null
);

create index if not exists audit_events_job_id_idx on audit_events(job_id);

