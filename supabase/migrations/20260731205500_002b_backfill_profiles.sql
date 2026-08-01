-- Backfill profiles for auth users created before the signup trigger existed.

INSERT INTO public.profiles (id, full_name, email, avatar_url)
SELECT
  users.id,
  users.raw_user_meta_data->>'full_name',
  users.email,
  users.raw_user_meta_data->>'avatar_url'
FROM auth.users AS users
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.devices WHERE user_id IS NULL) THEN
    RAISE EXCEPTION 'Devices without an owner must be assigned explicitly before migration.';
  END IF;
END;
$$;
