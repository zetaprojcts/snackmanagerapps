-- Migration 003: Add user_id to devices table

ALTER TABLE public.devices
ADD COLUMN IF NOT EXISTS user_id UUID;

-- Tambahkan foreign key ke profiles dengan CASCADE
ALTER TABLE public.devices
DROP CONSTRAINT IF EXISTS devices_user_id_fkey;

ALTER TABLE public.devices
ADD CONSTRAINT devices_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;
