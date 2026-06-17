import { supabase } from '../../lib/supabase';

// Mengambil semua daftar perangkat
export const fetchDevices = async () => {
  const { data, error } = await supabase
    .from('devices')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

// Menambah perangkat baru
export const createDevice = async (deviceData: { code: string; device_name: string; phone_number: string; email: string; ewallet: string }) => {
  const { data, error } = await supabase
    .from('devices')
    .insert([deviceData])
    .select();

  if (error) throw new Error(error.message);
  return data;
};

// Mengubah status Aktif / Tidak Aktif
export const toggleDeviceStatus = async (id: string, currentStatus: boolean) => {
  const { data, error } = await supabase
    .from('devices')
    .update({ is_active: !currentStatus })
    .eq('id', id);

  if (error) throw new Error(error.message);
  return data;
};

// Mengambil detail 1 perangkat beserta datanya
export const getDeviceById = async (id: string) => {
  const { data, error } = await supabase
    .from('devices')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// Mengambil transaksi (pemasukan & penarikan) khusus untuk 1 HP
export const getDeviceTransactions = async (deviceId: string) => {
  const { data: incomes, error: errIncome } = await supabase
    .from('income')
    .select('*')
    .eq('device_id', deviceId)
    .order('trx_date', { ascending: true }); // Urutkan dari terlama ke terbaru untuk grafik

  const { data: payments, error: errPayment } = await supabase
    .from('payment')
    .select('*')
    .eq('device_id', deviceId)
    .order('trx_date', { ascending: true });

  if (errIncome) throw new Error(errIncome.message);
  if (errPayment) throw new Error(errPayment.message);

  return { incomes: incomes || [], payments: payments || [] };
};

// Memperbarui profil perangkat
export const updateDevice = async (
  id: string, 
  deviceData: { code: string; device_name: string; phone_number: string; email: string; ewallet: string }
) => {
  const { data, error } = await supabase
    .from('devices')
    .update(deviceData)
    .eq('id', id)
    .select();

  if (error) throw new Error(error.message);
  return data;
};

// Mengambil semua data perangkat
export const getDevices = async () => {
  const { data, error } = await supabase
    .from('devices')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

// Mengambil kode perangkat terakhir dan membuat urutan baru
export const generateNextDeviceCode = async () => {
  // Ambil 1 data terakhir berdasarkan tanggal pembuatan
  const { data, error } = await supabase
    .from('devices')
    .select('code')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) throw new Error(error.message);

  // Jika database masih kosong sama sekali
  if (!data || data.length === 0 || !data[0].code) {
    return 'HP001';
  }

  const lastCode = data[0].code; // Contoh mendapat: "HP005"
  
  // Pisahkan huruf dan angka, lalu tambah 1
  // Angka akan diekstrak, jika "HP005" -> 5 + 1 = 6
  const numericPart = parseInt(lastCode.replace(/\D/g, ''), 10);
  
  if (isNaN(numericPart)) return 'HP001'; // Jaga-jaga jika format kode sebelumnya berantakan

  const nextNumber = numericPart + 1;
  
  // Gabungkan kembali dengan format 3 digit (006)
  return `HP${nextNumber.toString().padStart(3, '0')}`;
};

// Fungsi untuk menambahkan perangkat baru ke Supabase
export const addDevice = async (deviceData: { 
  code: string; 
  device_name: string; 
  phone_number: string; 
  email: string; 
  ewallet: string; 
  status: string; // <-- Tambahan status agar tidak error
}) => {
  const { data, error } = await supabase
    .from('devices')
    .insert([deviceData])
    .select();

  if (error) throw new Error(error.message);
  return data;
};