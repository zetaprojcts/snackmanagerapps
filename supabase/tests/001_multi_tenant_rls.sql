BEGIN;

SET LOCAL ROLE postgres;
SET LOCAL search_path = extensions, public, auth, pg_catalog;

CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;
GRANT USAGE ON SCHEMA extensions TO authenticated;

SELECT extensions.plan(36);

INSERT INTO auth.users (id, aud, role, email, encrypted_password)
VALUES
  ('10000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'tenant-a@example.test', ''),
  ('20000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'tenant-b@example.test', ''),
  ('30000000-0000-4000-8000-000000000003', 'authenticated', 'authenticated', 'tenant-c@example.test', '');

SELECT extensions.is(
  (SELECT count(*)::integer FROM storage.buckets WHERE id = 'avatars'),
  1,
  'Private avatars bucket exists'
);

SELECT extensions.lives_ok(
  $$UPDATE auth.users
    SET raw_user_meta_data = '{"full_name":"Updated User A"}'::jsonb
    WHERE id = '10000000-0000-4000-8000-000000000001'$$,
  'Auth user metadata can be updated'
);

SELECT extensions.is(
  (SELECT full_name FROM public.profiles WHERE id = '10000000-0000-4000-8000-000000000001'),
  'Updated User A',
  'Auth metadata changes synchronize to the profile'
);

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);

SELECT extensions.lives_ok(
  $$INSERT INTO public.devices (id, brand, device_name, is_active)
    VALUES ('a0000000-0000-4000-8000-000000000001', 'Test', 'Device A', true)$$,
  'User A can insert an owned device'
);

SELECT extensions.is(
  (SELECT code FROM public.devices WHERE device_name = 'Device A'),
  'HP001',
  'User A receives HP001'
);

SELECT extensions.is(
  (SELECT user_id FROM public.devices WHERE device_name = 'Device A'),
  '10000000-0000-4000-8000-000000000001'::uuid,
  'Database assigns User A as the device owner'
);

SELECT extensions.lives_ok(
  $$UPDATE public.profiles
    SET
      full_name = 'Tenant A',
      password_changed_at = '2026-08-02 02:20:00+00'
    WHERE id = '10000000-0000-4000-8000-000000000001'$$,
  'User A can update the own profile and password status'
);

SELECT extensions.lives_ok(
  $$INSERT INTO storage.objects (bucket_id, name)
    VALUES ('avatars', '10000000-0000-4000-8000-000000000001/avatar')$$,
  'User A can create an avatar object in the own folder'
);

SELECT set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000002', true);

SELECT extensions.lives_ok(
  $$INSERT INTO public.devices (id, brand, device_name, is_active)
    VALUES ('b0000000-0000-4000-8000-000000000002', 'Test', 'Device B', true)$$,
  'User B can insert an owned device'
);

SELECT extensions.is(
  (SELECT code FROM public.devices WHERE device_name = 'Device B'),
  'HP001',
  'User B independently receives HP001'
);

SELECT extensions.throws_ok(
  $$INSERT INTO public.devices (user_id, brand, device_name, is_active)
    VALUES (
      '10000000-0000-4000-8000-000000000001',
      'Test',
      'Invalid owner',
      true
    )$$,
  '42501',
  NULL,
  'User B cannot insert a device owned by User A'
);

SELECT extensions.is(
  (SELECT count(*)::integer FROM public.devices WHERE device_name = 'Device A'),
  0,
  'User B cannot select User A device'
);

SELECT extensions.lives_ok(
  $$UPDATE public.devices
    SET device_name = 'Cross tenant'
    WHERE id = 'a0000000-0000-4000-8000-000000000001'$$,
  'Cross-tenant update is filtered without exposing the target'
);

SELECT extensions.lives_ok(
  $$DELETE FROM public.devices
    WHERE id = 'a0000000-0000-4000-8000-000000000001'$$,
  'Cross-tenant delete is filtered without exposing the target'
);

SELECT extensions.lives_ok(
  $$UPDATE public.profiles
    SET
      full_name = 'Cross tenant profile',
      password_changed_at = '2026-08-03 02:20:00+00'
    WHERE id = '10000000-0000-4000-8000-000000000001'$$,
  'Cross-tenant profile update is filtered'
);

SELECT extensions.throws_ok(
  $$INSERT INTO storage.objects (bucket_id, name)
    VALUES ('avatars', '10000000-0000-4000-8000-000000000001/foreign-avatar')$$,
  '42501',
  NULL,
  'User B cannot create an object in User A avatar folder'
);

SELECT extensions.is(
  (
    SELECT count(*)::integer
    FROM storage.objects
    WHERE name = '10000000-0000-4000-8000-000000000001/avatar'
  ),
  0,
  'User B cannot read User A avatar object'
);

SELECT set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);

SELECT extensions.is(
  (SELECT device_name FROM public.devices WHERE id = 'a0000000-0000-4000-8000-000000000001'),
  'Device A',
  'User B did not update User A device'
);

SELECT extensions.is(
  (SELECT count(*)::integer FROM public.devices WHERE id = 'a0000000-0000-4000-8000-000000000001'),
  1,
  'User B did not delete User A device'
);

SELECT extensions.is(
  (SELECT full_name FROM public.profiles WHERE id = '10000000-0000-4000-8000-000000000001'),
  'Tenant A',
  'User B did not update User A profile'
);

SELECT extensions.is(
  (
    SELECT password_changed_at
    FROM public.profiles
    WHERE id = '10000000-0000-4000-8000-000000000001'
  ),
  '2026-08-02 02:20:00+00'::timestamptz,
  'User B did not update User A password status'
);

SELECT extensions.lives_ok(
  $$INSERT INTO public.income (device_id, amount, trx_date)
    SELECT id, 100, CURRENT_DATE FROM public.devices WHERE device_name = 'Device A'$$,
  'User A can insert income for an owned device'
);

SELECT extensions.lives_ok(
  $$INSERT INTO public.payment (device_id, gross_amount, admin_fee, net_amount, trx_date)
    SELECT id, 80, 5, 75, CURRENT_DATE FROM public.devices WHERE device_name = 'Device A'$$,
  'User A can insert payment for an owned device'
);

SELECT extensions.is(
  (SELECT total_amount FROM public.get_income_history_summary(NULL, NULL)),
  100::numeric,
  'Income summary only aggregates User A rows'
);

SELECT extensions.is(
  (SELECT row_count FROM public.get_income_history_summary(NULL, NULL)),
  1::bigint,
  'Income summary count only includes User A rows'
);

SELECT extensions.is(
  (SELECT total_amount FROM public.get_payment_history_summary(NULL, NULL)),
  80::numeric,
  'Payment summary only aggregates User A rows'
);

SELECT extensions.is(
  (SELECT total_income FROM public.get_balance_summary(CURRENT_DATE)),
  100::numeric,
  'Balance summary only aggregates User A income'
);

SELECT extensions.is(
  (SELECT total_gross_payment FROM public.get_balance_summary(CURRENT_DATE)),
  80::numeric,
  'Balance summary only aggregates User A payments'
);

SELECT extensions.is(
  (SELECT count(*)::integer FROM public.profiles),
  1,
  'User A can only select the own profile'
);

SELECT set_config('request.jwt.claim.sub', '30000000-0000-4000-8000-000000000003', true);

SELECT extensions.is(
  (SELECT count(*)::integer FROM public.devices),
  0,
  'New User C cannot see devices from other users'
);

SELECT extensions.is(
  (SELECT count(*)::integer FROM public.income),
  0,
  'New User C cannot see income from other users'
);

SELECT extensions.is(
  (SELECT count(*)::integer FROM public.payment),
  0,
  'New User C cannot see payment from other users'
);

SELECT extensions.is(
  (SELECT row_count FROM public.get_income_history_summary(NULL, NULL)),
  0::bigint,
  'New User C receives an empty income summary'
);

SELECT extensions.is(
  (SELECT total_gross_payment FROM public.get_balance_summary(CURRENT_DATE)),
  0::numeric,
  'New User C receives an empty balance summary'
);

SELECT extensions.lives_ok(
  $$INSERT INTO public.devices (id, brand, device_name, is_active)
    VALUES ('c0000000-0000-4000-8000-000000000003', 'Test', 'Device C', true)$$,
  'User C can insert an owned device'
);

SELECT extensions.is(
  (SELECT code FROM public.devices WHERE device_name = 'Device C'),
  'HP001',
  'User C independently receives HP001'
);

SET LOCAL ROLE postgres;

SELECT extensions.finish();

ROLLBACK;
