-- Resume versions, and which one was sent with each application.
--
-- The app stores a name, an optional link to wherever the file lives (Google
-- Drive, Dropbox, ...) and notes. It never stores the file itself.

create table public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,

  name text not null check (char_length(name) between 1 and 100),
  link_url text check (link_url ~* '^https?://' and char_length(link_url) <= 2000),
  notes text check (char_length(notes) <= 2000),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint resumes_user_id_name_key unique (user_id, name),
  -- Target for the composite foreign key on applications below.
  constraint resumes_id_user_id_key unique (id, user_id)
);

comment on table public.resumes is 'Named resume versions, owned by user_id.';

create trigger resumes_set_updated_at
  before update on public.resumes
  for each row
  execute function private.set_updated_at();

-- A foreign key check ignores row-level security, so a plain
-- `references resumes (id)` would let someone link another user's resume to
-- their own application if they knew its id. Including user_id in the key means
-- the resume must belong to the same user as the application.
--
-- Deleting a resume keeps the applications and only clears resume_id
-- (the column list stops Postgres from also clearing user_id).
alter table public.applications
  add column resume_id uuid,
  add constraint applications_resume_fkey
    foreign key (resume_id, user_id)
    references public.resumes (id, user_id)
    on delete set null (resume_id);

create index applications_user_id_resume_id_idx on public.applications (user_id, resume_id)
  where resume_id is not null;

-- Row-level security: the same rules as applications.
alter table public.resumes enable row level security;

revoke all on public.resumes from anon, authenticated;
grant select, insert, update, delete on public.resumes to authenticated;

create policy "Users can read their own resumes"
  on public.resumes for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create resumes for themselves"
  on public.resumes for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own resumes"
  on public.resumes for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own resumes"
  on public.resumes for delete
  to authenticated
  using ((select auth.uid()) = user_id);
