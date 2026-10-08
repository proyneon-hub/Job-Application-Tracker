-- Row-level security: the database itself enforces that users only see their own rows.
--
-- The browser talks to Supabase with the public "publishable" key, so these
-- policies, not the app code, are what actually protect the data. Even a
-- hand-crafted request with a valid session can't read another user's rows.
--
-- `(select auth.uid())` is wrapped in a sub-select so Postgres evaluates it once
-- per query instead of once per row (Supabase's recommended pattern).

alter table public.applications enable row level security;
alter table public.status_events enable row level security;

-- Least privilege: logged-out visitors (the `anon` role) get no access at all,
-- and status_events is read-only for users (only the trigger writes to it).
revoke all on public.applications from anon, authenticated;
revoke all on public.status_events from anon, authenticated;
grant select, insert, update, delete on public.applications to authenticated;
grant select on public.status_events to authenticated;

create policy "Users can read their own applications"
  on public.applications for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create applications for themselves"
  on public.applications for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own applications"
  on public.applications for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own applications"
  on public.applications for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can read their own status history"
  on public.status_events for select
  to authenticated
  using ((select auth.uid()) = user_id);
