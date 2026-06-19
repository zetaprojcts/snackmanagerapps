import { supabase } from "../../lib/supabase";

// Menyimpan pemasukan baru
export const addIncome = async (data: {
  device_id: string;
  amount: number;
  trx_date: string;
}) => {
  const { error } = await supabase
    .from("income")
    .insert([data]);

  if (error) {
    // 23505 = Duplicate
    if (error.code === "23505") {
      throw new Error(
        "DUPLICATE_DATE",
      );
    }

    throw new Error(
      error.message,
    );
  }

  return true;
};

// Menimpa pemasukan jika tanggal sama
export const updateIncome = async (data: {
  device_id: string;
  amount: number;
  trx_date: string;
}) => {
  const { error } =
    await supabase
      .from("income")
      .update({
        amount:
          data.amount,
      })
      .eq(
        "device_id",
        data.device_id,
      )
      .eq(
        "trx_date",
        data.trx_date,
      );

  if (error) {
    throw new Error(
      error.message,
    );
  }

  return true;
};

// Riwayat Income
export const fetchIncomes =
  async () => {
    const {
      data,
      error,
    } = await supabase
      .from("income")
      .select(
        `
        *,
        devices (
          device_name,
          brand
        )
      `,
      )
      .order(
        "trx_date",
        {
          ascending:
            false,
        },
      );

    if (error) {
      throw new Error(
        error.message,
      );
    }

    return data;
  };

// Detail Income
export const getIncomeById =
  async (
    id: string,
  ) => {
    const {
      data,
      error,
    } = await supabase
      .from("income")
      .select(
        `
        *,
        devices (
          id,
          code,
          brand,
          device_name,
          phone_number,
          email,
          ewallet,
          is_active
        )
      `,
      )
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(
        error.message,
      );
    }

    return data;
  };
