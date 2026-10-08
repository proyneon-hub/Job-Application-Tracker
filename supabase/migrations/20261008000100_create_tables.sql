-- Core tables for the job application tracker.
--
-- Every row carries a user_id that points at the Supabase Auth user who owns it.
-- Row-level security (see the rls migration) uses that column to make sure
-- people can only ever see and change their own data.

create type public.application_status as enum (
  'wishlist',
  'applied',
  'screening',
  'interview',
  'offer',
  'rejected',
  'withdrawn'
);

create type public.work_mode as enum ('remote', 'hybrid', 'on_site');

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  -- Defaults to the caller's id, so the app never has to send it (and can't spoof it: RLS checks it).
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,

  company text not null check (char_length(company) between 1 and 200),
  role_title text not null check (char_length(role_title) between 1 and 200),
  posting_url text check (posting_url ~* '^https?://' and char_length(posting_url) <= 2000),
  location text check (char_length(location) <= 200),
  work_mode public.work_mode,
  salary_min integer check (salary_min >= 0),
  salary_max integer check (salary_max >= 0),
  salary_currency text not null default 'USD' check (salary_currency ~ '^[A-Z]{3}$'),
  source text check (char_length(source) <= 200),
  status public.application_status not null default 'wishlist',
  date_applied date,
  next_follow_up date,
  contact_name text check (char_length(contact_name) <= 200),
  contact_email text check (char_length(contact_email) <= 320),
  notes text check (char_length(notes) <= 5000),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint salary_range_valid check (salary_min is null or salary_max is null or salary_min <= salary_max)
);

comment on table public.applications is 'One row per job application, owned by user_id.';

-- The app always filters by user (RLS adds `user_id = auth.uid()` to every query),
-- so indexes lead with user_id.
create index applications_user_id_status_idx on public.applications (user_id, status);
create index applications_user_id_follow_up_idx on public.applications (user_id, next_follow_up)
  where next_follow_up is not null;

create table public.status_events (
  id bigint generated always as identity primary key,
  application_id uuid not null references public.applications (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  -- Null for the event recorded when an application is first created.
  from_status public.application_status,
  to_status public.application_status not null,
  changed_at timestamptz not null default now()
);

comment on table public.status_events is
  'Append-only history of status changes. Written only by a trigger on applications.';

create index status_events_application_id_idx on public.status_events (application_id, changed_at);
create index status_events_user_id_idx on public.status_events (user_id);
