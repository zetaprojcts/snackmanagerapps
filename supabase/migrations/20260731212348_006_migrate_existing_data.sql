-- Migration 006: Assign legacy devices when exactly one Auth owner exists.
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

    UPDATE public.devices
    SET user_id = legacy_owner_id
    WHERE user_id IS NULL;
  END IF;
END;
$$;

ALTER TABLE public.devices
ALTER COLUMN user_id SET NOT NULL;
