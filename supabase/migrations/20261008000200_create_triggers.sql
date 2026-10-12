-- Triggers: keep updated_at fresh and record status history automatically.
--
-- Trigger functions live in a `private` schema. Supabase exposes the `public`
-- schema over its REST API, so keeping helpers out of it means they can never
-- be called directly by a client.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger applications_set_updated_at
  before update on public.applications
  for each row
  execute function private.set_updated_at();

-- Records a status_events row whenever an application is created or its status changes.
--
-- Doing this in the database (instead of in app code) means history can't be
-- skipped by a buggy client, and the event is written in the same transaction
-- as the change it describes.
--
-- SECURITY DEFINER lets the function insert into status_events even though
-- users have no INSERT permission on that table, so users can read their
-- history but can never forge it. It's safe because the function only ever
-- copies values from the application row that RLS has already approved.
create function private.record_status_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.status_events (application_id, user_id, from_status, to_status)
    values (new.id, new.user_id, null, new.status);
  elsif new.status is distinct from old.status then
    insert into public.status_events (application_id, user_id, from_status, to_status)
    values (new.id, new.user_id, old.status, new.status);
  end if;
  return new;
end;
$$;

create trigger applications_record_status_event
  after insert or update of status on public.applications
  for each row
  execute function private.record_status_event();
