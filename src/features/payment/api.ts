import { supabase } from "../../lib/supabase";
import type { HistoryDateRange } from "../transactions/history";

type PaymentHistoryParams = HistoryDateRange & {
  page: number;
  pageSize: number;
};

export const addPayment = async (data: {
  device_id: string;
  gross_amount: number;
  admin_fee: number;
  net_amount: number;
  trx_date: string;
}) => {
  const { error } = await supabase
    .from("payment")
    .insert([data]);

  if (error) {
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

export const updatePayment = async (data: {
  device_id: string;
  gross_amount: number;
  admin_fee: number;
  net_amount: number;
  trx_date: string;
}) => {
  const { error } =
    await supabase
      .from("payment")
      .update({
        gross_amount:
          data.gross_amount,
        admin_fee:
          data.admin_fee,
        net_amount:
          data.net_amount,
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

export const updatePaymentById = async (
  id: string,
  data: {
    gross_amount: number;
    admin_fee: number;
    net_amount: number;
    trx_date: string;
  },
) => {
  const { error } = await supabase.from("payment").update(data).eq("id", id);

  if (error) {
    if (error.code === "23505") {
      throw new Error("DUPLICATE_DATE");
    }

    throw new Error(error.message);
  }

  return true;
};

export const deletePaymentById = async (id: string) => {
  const { error } = await supabase.from("payment").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  return true;
};

export const fetchPayments =
  async () => {
    const {
      data,
      error,
    } = await supabase
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

export const fetchPaymentHistory = async ({
  startDate,
  endDate,
  page,
  pageSize,
}: PaymentHistoryParams) => {
  const from = page * pageSize;
  const to = from + pageSize - 1;
  let query = supabase
    .from("payment")
    .select(
      `
        id,
        device_id,
        gross_amount,
        admin_fee,
        net_amount,
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

export const fetchPaymentHistorySummary = async ({
  startDate,
  endDate,
}: HistoryDateRange) => {
  const { data, error } = await supabase.rpc("get_payment_history_summary", {
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

export const fetchPaymentsByDevice = async (deviceId: string) => {
  const { data, error } = await supabase
    .from("payment")
    .select(
      "id, device_id, gross_amount, admin_fee, net_amount, trx_date, created_at",
    )
    .eq("device_id", deviceId)
    .order("trx_date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getPaymentById =
  async (
    id: string,
  ) => {
    const {
      data,
      error,
    } = await supabase
      .from("payment")
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
