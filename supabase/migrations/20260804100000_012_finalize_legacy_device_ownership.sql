-- Remove permissive single-user policies before finalizing legacy ownership.
DO $$
DECLARE
  legacy_policy record;
BEGIN
  FOR legacy_policy IN
    SELECT tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('devices', 'income', 'payment')
      AND policyname NOT IN (
        'Users manage own devices',
        'Users manage own income',
        'Users manage own payment'
      )
  LOOP
    EXECUTE format(
      'DROP POLICY %I ON public.%I',
      legacy_policy.policyname,
      legacy_policy.tablename
    );
  END LOOP;
END;
$$;

-- Finalize ownership for legacy single-user databases after profiles and RLS exist.
DO $$
DECLARE
  legacy_owner_id uuid;
BEGIN
  IF EXISTS (SELECT 1 FROM public.devices WHERE user_id IS NULL) THEN
    IF (SELECT count(*) FROM auth.users) <> 1 THEN
      RAISE EXCEPTION
        'Legacy ownership requires exactly one auth user before backfill';
    END IF;

    SELECT id
    INTO legacy_owner_id
    FROM auth.users
    LIMIT 1;

    INSERT INTO public.profiles (id, full_name, email, avatar_url)
    SELECT
      users.id,
      COALESCE(
        NULLIF(users.raw_user_meta_data ->> 'full_name', ''),
        split_part(COALESCE(users.email, ''), '@', 1),
        'Pengguna'
      ),
      users.email,
      NULLIF(users.raw_user_meta_data ->> 'avatar_url', '')
    FROM auth.users AS users
    WHERE users.id = legacy_owner_id
    ON CONFLICT (id) DO NOTHING;

    UPDATE public.devices
    SET user_id = legacy_owner_id
    WHERE user_id IS NULL;
  END IF;

  IF EXISTS (SELECT 1 FROM public.devices WHERE user_id IS NULL) THEN
    RAISE EXCEPTION 'Device ownership backfill is incomplete';
  END IF;
END;
$$;

ALTER TABLE public.devices
ALTER COLUMN user_id SET NOT NULL;
