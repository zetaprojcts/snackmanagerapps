import { supabase } from "../../lib/supabase";

export const addPayment = async (data: {
  device_id: string;
  gross_amount: number;
  admin_fee: number;
  net_amount: number;
  trx_date: string;
}) => {
  const { error } = await supabase.from("payment").insert([data]);
  if (error) throw new Error(error.message);
  return true;
};

// Mengambil riwayat penarikan beserta nama perangkatnya
export const fetchPayments = async () => {
  const { data, error } = await supabase
    .from("payment")
    .select(`*, devices (device_name)`)
    .order("trx_date", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};
