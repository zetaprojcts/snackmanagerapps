CREATE INDEX IF NOT EXISTS income_trx_date_desc_idx
  ON public.income (trx_date DESC);

CREATE INDEX IF NOT EXISTS payment_trx_date_desc_idx
  ON public.payment (trx_date DESC);

CREATE OR REPLACE FUNCTION public.get_income_history_summary(
  p_start_date date DEFAULT NULL,
  p_end_date date DEFAULT NULL
)
RETURNS TABLE(total_amount numeric, row_count bigint)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT
    COALESCE(SUM(i.amount), 0)::numeric AS total_amount,
    COUNT(*)::bigint AS row_count
  FROM public.income AS i
  WHERE (p_start_date IS NULL OR i.trx_date >= p_start_date)
    AND (p_end_date IS NULL OR i.trx_date <= p_end_date);
$$;

CREATE OR REPLACE FUNCTION public.get_payment_history_summary(
  p_start_date date DEFAULT NULL,
  p_end_date date DEFAULT NULL
)
RETURNS TABLE(total_amount numeric, row_count bigint)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT
    COALESCE(SUM(p.gross_amount), 0)::numeric AS total_amount,
    COUNT(*)::bigint AS row_count
  FROM public.payment AS p
  WHERE (p_start_date IS NULL OR p.trx_date >= p_start_date)
    AND (p_end_date IS NULL OR p.trx_date <= p_end_date);
$$;

CREATE OR REPLACE FUNCTION public.get_balance_summary(
  p_today date DEFAULT CURRENT_DATE
)
RETURNS TABLE(
  total_income numeric,
  total_gross_payment numeric,
  total_admin_fee numeric,
  income_this_month numeric,
  expense_this_month numeric,
  admin_fee_this_month numeric
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  WITH bounds AS (
    SELECT
      date_trunc('month', p_today)::date AS month_start,
      (date_trunc('month', p_today) + interval '1 month')::date AS next_month_start
  ),
  income_stats AS (
    SELECT
      COALESCE(SUM(i.amount), 0)::numeric AS total_income,
      COALESCE(
        SUM(i.amount) FILTER (
          WHERE i.trx_date >= b.month_start
            AND i.trx_date < b.next_month_start
        ),
        0
      )::numeric AS income_this_month
    FROM public.income AS i
    CROSS JOIN bounds AS b
  ),
  payment_stats AS (
    SELECT
      COALESCE(SUM(p.gross_amount), 0)::numeric AS total_gross_payment,
      COALESCE(SUM(p.admin_fee), 0)::numeric AS total_admin_fee,
      COALESCE(
        SUM(p.net_amount) FILTER (
          WHERE p.trx_date >= b.month_start
            AND p.trx_date < b.next_month_start
        ),
        0
      )::numeric AS expense_this_month,
      COALESCE(
        SUM(p.admin_fee) FILTER (
          WHERE p.trx_date >= b.month_start
            AND p.trx_date < b.next_month_start
        ),
        0
      )::numeric AS admin_fee_this_month
    FROM public.payment AS p
    CROSS JOIN bounds AS b
  )
  SELECT
    i.total_income,
    p.total_gross_payment,
    p.total_admin_fee,
    i.income_this_month,
    p.expense_this_month,
    p.admin_fee_this_month
  FROM income_stats AS i
  CROSS JOIN payment_stats AS p;
$$;

REVOKE ALL ON FUNCTION public.get_income_history_summary(date, date) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_income_history_summary(date, date) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_income_history_summary(date, date) TO authenticated;

REVOKE ALL ON FUNCTION public.get_payment_history_summary(date, date) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_payment_history_summary(date, date) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_payment_history_summary(date, date) TO authenticated;

REVOKE ALL ON FUNCTION public.get_balance_summary(date) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_balance_summary(date) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_balance_summary(date) TO authenticated;
