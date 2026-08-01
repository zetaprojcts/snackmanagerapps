-- Migration 006: Assign existing devices to Administrator & enforce NOT NULL

UPDATE public.devices
SET user_id = '99bcccf0-fe84-42b0-8fc4-85ffb184144f'::uuid
WHERE user_id IS NULL;

ALTER TABLE public.devices
ALTER COLUMN user_id SET NOT NULL;
