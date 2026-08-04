import { supabase } from "../../lib/supabase";

export type BalanceSummary = {
  totalIncome: number;
  totalGrossPayment: number;
  totalAdminFee: number;
  incomeThisMonth: number;
  expenseThisMonth: number;
  adminFeeThisMonth: number;
};

export const fetchBalanceSummary = async (today: string) => {
  const { data, error } = await supabase.rpc("get_balance_summary", {
    p_today: today,
  });

  if (error) {
    throw new Error(error.message);
  }

  const row = Array.isArray(data) ? data[0] : data;

  return {
    totalIncome: Number(row?.total_income ?? 0),
    totalGrossPayment: Number(row?.total_gross_payment ?? 0),
    totalAdminFee: Number(row?.total_admin_fee ?? 0),
    incomeThisMonth: Number(row?.income_this_month ?? 0),
    expenseThisMonth: Number(row?.expense_this_month ?? 0),
    adminFeeThisMonth: Number(row?.admin_fee_this_month ?? 0),
  } satisfies BalanceSummary;
};
