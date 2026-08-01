-- Migration 004: Create Indexes for Performance

CREATE INDEX IF NOT EXISTS devices_user_id_idx ON public.devices(user_id);
CREATE INDEX IF NOT EXISTS idx_income_device ON public.income(device_id);
CREATE INDEX IF NOT EXISTS idx_payment_device ON public.payment(device_id);
