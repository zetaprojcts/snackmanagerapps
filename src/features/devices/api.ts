import { supabase } from "../../lib/supabase";

export type Device = {
  id: string;
  code?: string;
  brand: string | null;
  device_name: string;
  phone_number: string | null;
  email: string | null;
  ewallet: string | null;
  is_active: boolean;
  created_at: string;
};

export const BRANDS = [
  "Samsung",
  "Oppo",
  "Vivo",
  "Xiaomi",
  "Realme",
  "Infinix",
];

export const getDevices = async () => {
  const { data, error } = await supabase
    .from("devices")
    .select("*")
    .order("device_name", {
      ascending: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

export const getDevicesWithBalance = async () => {
  const { data: devices, error } = await supabase
    .from("devices")
    .select("*")
    .order("device_name", {
      ascending: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  if (!devices?.length) {
    return [];
  }

  const deviceIds = devices.map((device) => device.id);

  const { data: incomes, error: incomeError } = await supabase
    .from("income")
    .select("device_id, amount")
    .in("device_id", deviceIds);

  if (incomeError) {
    throw new Error(incomeError.message);
  }

  const { data: payments, error: paymentError } = await supabase
    .from("payment")
    .select("device_id, gross_amount")
    .in("device_id", deviceIds);

  if (paymentError) {
    throw new Error(paymentError.message);
  }

  return devices.map((device) => {
    const totalIncome = (incomes || [])
      .filter((income) => income.device_id === device.id)
      .reduce((total, current) => total + Number(current.amount), 0);

    const totalPayment = (payments || [])
      .filter((payment) => payment.device_id === device.id)
      .reduce((total, current) => total + Number(current.gross_amount), 0);

    return {
      ...device,
      balance: totalIncome - totalPayment,
    };
  });
};

export const getDeviceById = async (id: string) => {
  const { data, error } = await supabase
    .from("devices")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getDeviceDetail = async (id: string) => {
  const device = await getDeviceById(id);

  const { data: incomes, error: incomeError } = await supabase
    .from("income")
    .select("*")
    .eq("device_id", id)
    .order("trx_date", {
      ascending: false,
    });

  if (incomeError) {
    throw new Error(incomeError.message);
  }

  const { data: payments, error: paymentError } = await supabase
    .from("payment")
    .select("*")
    .eq("device_id", id)
    .order("trx_date", {
      ascending: false,
    });

  if (paymentError) {
    throw new Error(paymentError.message);
  }

  const totalIncome = (incomes || []).reduce(
    (total, current) => total + Number(current.amount),
    0,
  );

  const totalPayment = (payments || []).reduce(
    (total, current) => total + Number(current.gross_amount),
    0,
  );

  return {
    device,
    incomes: incomes || [],
    payments: payments || [],
    totalIncome,
    totalPayment,
    balance: totalIncome - totalPayment,
  };
};

export const addDevice = async (deviceData: {
  brand: string;
  device_name: string;
  phone_number?: string;
  email?: string;
  ewallet?: string | null;
  is_active: boolean;
}) => {
  const code = await generateNextDeviceCode();

  const { data, error } = await supabase
    .from("devices")
    .insert([
      {
        code,
        brand: deviceData.brand,
        device_name: deviceData.device_name,
        phone_number: deviceData.phone_number || null,
        email: deviceData.email || null,
        ewallet: deviceData.ewallet || null,
        is_active: deviceData.is_active,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updateDevice = async (
  id: string,
  deviceData: {
    brand: string;
    device_name: string;
    phone_number?: string;
    email?: string;
    ewallet?: string | null;
    is_active: boolean;
  },
) => {
  const { data, error } = await supabase
    .from("devices")
    .update({
      brand: deviceData.brand,
      device_name: deviceData.device_name,
      phone_number: deviceData.phone_number || null,
      email: deviceData.email || null,
      ewallet: deviceData.ewallet || null,
      is_active: deviceData.is_active,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const generateNextDeviceCode = async () => {
  const { data, error } = await supabase
    .from("devices")
    .select("code")
    .order("created_at", {
      ascending: false,
    })
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    return "HP001";
  }

  const lastCode = data[0]?.code;

  if (!lastCode) {
    return "HP001";
  }

  const lastNumber = parseInt(lastCode.replace(/\D/g, ""), 10);

  if (Number.isNaN(lastNumber)) {
    return "HP001";
  }

  return `HP${String(lastNumber + 1).padStart(3, "0")}`;
};
