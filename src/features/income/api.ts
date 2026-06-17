import { supabase } from '../../lib/supabase';

// Menyimpan pemasukan baru
export const addIncome = async (data: { device_id: string; amount: number; trx_date: string }) => {
  const { error } = await supabase.from('income').insert([data]);
  
  if (error) {
    // 23505 adalah kode standar PostgreSQL untuk pelanggaran UNIQUE (data ganda)
    if (error.code === '23505') throw new Error('DUPLICATE_DATE');
    throw new Error(error.message);
  }
  return true;
};

// Menimpa (Update) data pemasukan jika user memilih "Edit/Timpa"
export const updateIncome = async (data: { device_id: string; amount: number; trx_date: string }) => {
  const { error } = await supabase
    .from('income')
    .update({ amount: data.amount })
    .eq('device_id', data.device_id)
    .eq('trx_date', data.trx_date);

  if (error) throw new Error(error.message);
  return true;
};

// Mengambil riwayat pemasukan beserta nama perangkatnya
export const fetchIncomes = async () => {
  const { data, error } = await supabase
    .from('income')
    .select(`*, devices (device_name)`)
    .order('trx_date', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};