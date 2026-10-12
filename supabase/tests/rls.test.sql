-- Proves row-level security isolates users from each other.
-- Run with: npx supabase test db   (needs `npx supabase start` first; runs in CI too)
--
-- Two users, Alice (A) and Bob (B), are created. Alice adds an application,
-- then we act as Bob and try every way of reading or changing it.
-- Everything runs inside a transaction that is rolled back at the end.

begin;
create extension if not exists pgtap with schema extensions;

select plan(17);

-- Test users. Fixed ids so the assertions below can refer to them.
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'alice@example.test'),
  ('00000000-0000-0000-0000-00000000000b', 'bob@example.test');

-- ---------------------------------------------------------------------------
-- Act as Alice
-- ---------------------------------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}', true);

select lives_ok(
  $$ insert into public.applications (id, company, role_title, status)
     values ('11111111-1111-1111-1111-111111111111', 'Example Widgets Ltd', 'Frontend Engineer', 'applied') $$,
  'Alice can create an application'
);

select is(
  (select user_id from public.applications where id = '11111111-1111-1111-1111-111111111111'),
  '00000000-0000-0000-0000-00000000000a'::uuid,
  'user_id defaults to the logged-in user'
);

select is(
  (select count(*)::int from public.status_events where application_id = '11111111-1111-1111-1111-111111111111'),
  1,
  'Creating an application records an initial status event'
);

update public.applications set status = 'screening' where id = '11111111-1111-1111-1111-111111111111';

select results_eq(
  $$ select from_status::text, to_status::text from public.status_events
     where application_id = '11111111-1111-1111-1111-111111111111' order by changed_at, id $$,
  $$ values (null::text, 'applied'::text), ('applied', 'screening') $$,
  'Changing status records a from -> to event'
);

update public.applications set notes = 'Phone screen booked' where id = '11111111-1111-1111-1111-111111111111';

select is(
  (select count(*)::int from public.status_events where application_id = '11111111-1111-1111-1111-111111111111'),
  2,
  'Editing other fields does not record a status event'
);

select throws_ok(
  $$ update public.applications set user_id = '00000000-0000-0000-0000-00000000000b'
     where id = '11111111-1111-1111-1111-111111111111' $$,
  '42501', null,
  'Alice cannot hand her application over to another user'
);

select throws_ok(
  $$ insert into public.status_events (application_id, user_id, to_status)
     values ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-00000000000a', 'offer') $$,
  '42501', null,
  'Users cannot forge status history directly'
);

-- ---------------------------------------------------------------------------
-- Act as Bob
-- ---------------------------------------------------------------------------
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated"}', true);

select is(
  (select count(*)::int from public.applications),
  0,
  'Bob sees none of Alice''s applications'
);

select is(
  (select count(*)::int from public.status_events),
  0,
  'Bob sees none of Alice''s status history'
);

-- RLS hides the row, so the UPDATE/DELETE silently matches nothing (no rows returned).
select is_empty(
  $$ update public.applications set company = 'Hijacked'
     where id = '11111111-1111-1111-1111-111111111111' returning id $$,
  'Bob cannot update Alice''s application'
);

select is_empty(
  $$ delete from public.applications where id = '11111111-1111-1111-1111-111111111111' returning id $$,
  'Bob cannot delete Alice''s application'
);

select throws_ok(
  $$ insert into public.applications (company, role_title, user_id)
     values ('Sneaky Corp', 'Spy', '00000000-0000-0000-0000-00000000000a') $$,
  '42501', null,
  'Bob cannot create an application owned by Alice'
);

select lives_ok(
  $$ insert into public.applications (company, role_title) values ('Bobco Fictional Inc', 'Designer') $$,
  'Bob can create his own application'
);

select is(
  (select count(*)::int from public.applications),
  1,
  'Bob sees exactly his own application'
);

-- ---------------------------------------------------------------------------
-- Back to Alice: her data is untouched
-- ---------------------------------------------------------------------------
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}', true);

select results_eq(
  $$ select company from public.applications $$,
  $$ values ('Example Widgets Ltd'::text) $$,
  'Alice still has exactly her one, unmodified application'
);

-- ---------------------------------------------------------------------------
-- Logged-out visitors
-- ---------------------------------------------------------------------------
reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);

select throws_ok(
  $$ select * from public.applications $$,
  '42501', null,
  'Anonymous visitors cannot read applications'
);

select throws_ok(
  $$ select * from public.status_events $$,
  '42501', null,
  'Anonymous visitors cannot read status history'
);

select * from finish();
rollback;
