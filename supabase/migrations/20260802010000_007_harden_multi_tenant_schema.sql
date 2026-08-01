-- Harden tenant ownership, profile access, and device code generation.

INSERT INTO public.profiles (id, full_name, email, avatar_url)
SELECT
  users.id,
  users.raw_user_meta_data->>'full_name',
  users.email,
  users.raw_user_meta_data->>'avatar_url'
FROM auth.users AS users
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = id)
WITH CHECK ((SELECT auth.uid()) = id);

REVOKE ALL ON TABLE public.profiles FROM PUBLIC, anon;
GRANT SELECT, UPDATE ON TABLE public.profiles TO authenticated;

ALTER TABLE public.devices
ALTER COLUMN user_id SET DEFAULT auth.uid();

ALTER TABLE public.devices
DROP CONSTRAINT IF EXISTS devices_user_id_fkey;

ALTER TABLE public.devices
ADD CONSTRAINT devices_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

WITH owner_maximum AS (
  SELECT
    user_id,
    COALESCE(
      MAX((substr(code, 3))::integer) FILTER (WHERE code ~ '^HP[0-9]+$'),
      0
    ) AS maximum_code
  FROM public.devices
  GROUP BY user_id
),
missing_codes AS (
  SELECT
    devices.id,
    devices.user_id,
    COALESCE(owner_maximum.maximum_code, 0) + ROW_NUMBER() OVER (
      PARTITION BY devices.user_id
      ORDER BY devices.created_at, devices.id
    ) AS next_code
  FROM public.devices AS devices
  LEFT JOIN owner_maximum USING (user_id)
  WHERE devices.code IS NULL
)
UPDATE public.devices AS devices
SET code = 'HP' || lpad(missing_codes.next_code::text, 3, '0')
FROM missing_codes
WHERE devices.id = missing_codes.id;

ALTER TABLE public.devices
DROP CONSTRAINT IF EXISTS devices_code_key;

ALTER TABLE public.devices
ALTER COLUMN code SET NOT NULL;

ALTER TABLE public.devices
ADD CONSTRAINT devices_user_code_key UNIQUE (user_id, code);

DROP TRIGGER IF EXISTS generate_device_code ON public.devices;
DROP TRIGGER IF EXISTS set_device_code ON public.devices;
DROP TRIGGER IF EXISTS set_device_identity ON public.devices;
DROP FUNCTION IF EXISTS public.generate_device_code();
DROP SEQUENCE IF EXISTS public.device_code_seq;

CREATE OR REPLACE FUNCTION public.assign_device_identity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  authenticated_user_id uuid := auth.uid();
  next_number integer;
BEGIN
  IF authenticated_user_id IS NOT NULL THEN
    NEW.user_id := authenticated_user_id;
  END IF;

  IF NEW.user_id IS NULL THEN
    RAISE EXCEPTION 'A device owner is required.' USING ERRCODE = '23502';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(NEW.user_id::text, 0)
  );

  SELECT COALESCE(
    MAX((pg_catalog.substr(devices.code, 3))::integer)
      FILTER (WHERE devices.code ~ '^HP[0-9]+$'),
    0
  ) + 1
  INTO next_number
  FROM public.devices AS devices
  WHERE devices.user_id = NEW.user_id;

  NEW.code := 'HP' || pg_catalog.lpad(next_number::text, 3, '0');
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.assign_device_identity() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER set_device_identity
BEFORE INSERT ON public.devices
FOR EACH ROW
EXECUTE FUNCTION public.assign_device_identity();

DROP POLICY IF EXISTS "Users manage own devices" ON public.devices;
DROP POLICY IF EXISTS "Users manage own income" ON public.income;
DROP POLICY IF EXISTS "Users manage own payment" ON public.payment;

CREATE POLICY "Users manage own devices"
ON public.devices
FOR ALL
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users manage own income"
ON public.income
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.devices AS devices
    WHERE devices.id = income.device_id
      AND devices.user_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.devices AS devices
    WHERE devices.id = income.device_id
      AND devices.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Users manage own payment"
ON public.payment
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.devices AS devices
    WHERE devices.id = payment.device_id
      AND devices.user_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.devices AS devices
    WHERE devices.id = payment.device_id
      AND devices.user_id = (SELECT auth.uid())
  )
);

REVOKE ALL ON TABLE public.devices, public.income, public.payment FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.devices, public.income, public.payment TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
REVOKE ALL ON TABLES FROM anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
REVOKE ALL ON SEQUENCES FROM anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, anon, authenticated;

ALTER TABLE public.payment
DROP CONSTRAINT IF EXISTS unique_payment;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_constraint
    WHERE conname = 'income_amount_positive'
      AND conrelid = 'public.income'::regclass
  ) THEN
    ALTER TABLE public.income
    ADD CONSTRAINT income_amount_positive CHECK (amount > 0) NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_constraint
    WHERE conname = 'payment_amounts_valid'
      AND conrelid = 'public.payment'::regclass
  ) THEN
    ALTER TABLE public.payment
    ADD CONSTRAINT payment_amounts_valid CHECK (
      gross_amount > 0
      AND admin_fee >= 0
      AND net_amount >= 0
      AND net_amount = gross_amount - admin_fee
    ) NOT VALID;
  END IF;
END;
$$;

DROP FUNCTION IF EXISTS public.update_updated_at_column();

REVOKE ALL ON FUNCTION public.update_timestamp() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
