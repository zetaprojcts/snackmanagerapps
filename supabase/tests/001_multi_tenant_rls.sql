BEGIN;

SET LOCAL ROLE postgres;
SET LOCAL search_path = extensions, public, auth, pg_catalog;

CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;
GRANT USAGE ON SCHEMA extensions TO authenticated;

SELECT extensions.plan(19);

INSERT INTO auth.users (id, aud, role, email, encrypted_password)
VALUES
  ('10000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'tenant-a@example.test', ''),
  ('20000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'tenant-b@example.test', ''),
  ('30000000-0000-4000-8000-000000000003', 'authenticated', 'authenticated', 'tenant-c@example.test', '');

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
