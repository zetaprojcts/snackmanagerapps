-- Reject explicit cross-tenant ownership instead of silently correcting it.

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
  IF NEW.user_id IS NULL THEN
    NEW.user_id := authenticated_user_id;
  ELSIF authenticated_user_id IS NOT NULL
    AND NEW.user_id <> authenticated_user_id THEN
    RAISE EXCEPTION 'A device cannot be assigned to another user.'
      USING ERRCODE = '42501';
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
