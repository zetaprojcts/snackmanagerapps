import { supabase } from "../../lib/supabase";
import type { HistoryDateRange } from "../transactions/history";

type IncomeHistoryParams = HistoryDateRange & {
  page: number;
  pageSize: number;
};

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

export const updateIncomeById = async (
  id: string,
  data: { amount: number; trx_date: string },
) => {
  const { error } = await supabase.from("income").update(data).eq("id", id);

  if (error) {
    if (error.code === "23505") {
      throw new Error("DUPLICATE_DATE");
    }

    throw new Error(error.message);
  }

  return true;
};

export const deleteIncomeById = async (id: string) => {
  const { error } = await supabase.from("income").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
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

export const fetchIncomeHistory = async ({
  startDate,
  endDate,
  page,
  pageSize,
}: IncomeHistoryParams) => {
  const from = page * pageSize;
  const to = from + pageSize - 1;
  let query = supabase
    .from("income")
    .select(
      `
        id,
        device_id,
        amount,
        trx_date,
        created_at,
        devices (
          device_name,
          brand
        )
      `,
    )
    .order("trx_date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (startDate) {
    query = query.gte("trx_date", startDate);
  }

  if (endDate) {
    query = query.lte("trx_date", endDate);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return {
    items: data,
    nextPage: data.length === pageSize ? page + 1 : undefined,
  };
};

export const fetchIncomeHistorySummary = async ({
  startDate,
  endDate,
}: HistoryDateRange) => {
  const { data, error } = await supabase.rpc("get_income_history_summary", {
    p_start_date: startDate ?? null,
    p_end_date: endDate ?? null,
  });

  if (error) {
    throw new Error(error.message);
  }

  const row = Array.isArray(data) ? data[0] : data;

  return {
    totalAmount: Number(row?.total_amount ?? 0),
    rowCount: Number(row?.row_count ?? 0),
  };
};

export const fetchIncomesByDevice = async (deviceId: string) => {
  const { data, error } = await supabase
    .from("income")
    .select("id, device_id, amount, trx_date, created_at")
    .eq("device_id", deviceId)
    .order("trx_date", { ascending: false });

  if (error) {
    throw new Error(error.message);
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
