-- Migration 005: Enable Row Level Security (RLS) and Policies

ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment ENABLE ROW LEVEL SECURITY;

-- Bersihkan policy lama jika ada
DROP POLICY IF EXISTS "Users manage own devices" ON public.devices;
DROP POLICY IF EXISTS "Users manage own income" ON public.income;
DROP POLICY IF EXISTS "Users manage own payment" ON public.payment;

-- Policy devices
CREATE POLICY "Users manage own devices"
ON public.devices FOR ALL
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

-- Policy income
CREATE POLICY "Users manage own income"
ON public.income FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.devices d
        WHERE d.id = income.device_id AND d.user_id = (SELECT auth.uid())
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.devices d
        WHERE d.id = income.device_id AND d.user_id = (SELECT auth.uid())
    )
);

-- Policy payment
CREATE POLICY "Users manage own payment"
ON public.payment FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.devices d
        WHERE d.id = payment.device_id AND d.user_id = (SELECT auth.uid())
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.devices d
        WHERE d.id = payment.device_id AND d.user_id = (SELECT auth.uid())
    )
);

-- Hak akses role
REVOKE ALL PRIVILEGES ON TABLE public.devices, public.income, public.payment FROM public, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.devices, public.income, public.payment TO authenticated;
