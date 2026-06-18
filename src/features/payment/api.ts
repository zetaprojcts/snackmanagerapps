import { supabase } from "../../lib/supabase";

export const addPayment = async (data: {
  device_id: string;
  gross_amount: number;
  admin_fee: number;
  net_amount: number;
  trx_date: string;
}) => {
  const { error } = await supabase.from("payment").insert([data]);

  if (error) {
    if (error.code === "23505") {
      throw new Error("DUPLICATE_DATE");
    }

    throw new Error(error.message);
  }

  return true;
};

export const updatePayment = async (data: {
  device_id: string;
  gross_amount: number;
  admin_fee: number;
  net_amount: number;
  trx_date: string;
}) => {
  const { error } = await supabase
    .from("payment")
    .update({
      gross_amount: data.gross_amount,
      admin_fee: data.admin_fee,
      net_amount: data.net_amount,
    })
    .eq("device_id", data.device_id)
    .eq("trx_date", data.trx_date);

  if (error) {
    throw new Error(error.message);
  }

  return true;
};

export const fetchPayments = async () => {
  const { data, error } = await supabase
    .from("payment")
    .select(
      `
      *,
      devices (
        device_name,
        brand
      )
    `,
    )
    .order("trx_date", {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
