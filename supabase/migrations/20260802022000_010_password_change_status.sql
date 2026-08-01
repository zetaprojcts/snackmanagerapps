-- Record password changes initiated from the account screen.

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS password_changed_at timestamptz;
