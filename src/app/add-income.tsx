import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { ChevronLeft, Save } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Chip } from '../components/ui/Chip';
import { fetchDevices } from '../features/devices/api';
import { addIncome, updateIncome } from '../features/income/api';
import { COLORS } from '../theme';

export default function AddIncome() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: devices, isLoading: isLoadingDevices } = useQuery({ queryKey: ['devices'], queryFn: fetchDevices });
  const activeDevices = devices?.filter(d => d.is_active) || [];

  const handleSave = async () => {
    if (!selectedDeviceId) return Alert.alert('Error', 'Pilih perangkat terlebih dahulu!');
    if (!amount) return Alert.alert('Error', 'Nominal tidak boleh kosong!');

    setLoading(true);
    // Kita gunakan tanggal lokal hari ini (Format YYYY-MM-DD)
    const today = new Date().toLocaleDateString('en-CA'); 
    const incomeData = { device_id: selectedDeviceId, amount: Number(amount), trx_date: today };

    try {
      await addIncome(incomeData);
      Alert.alert('Sukses', 'Pemasukan berhasil dicatat!');
      queryClient.invalidateQueries({ queryKey: ['income'] });
      router.back();
    } catch (error: any) {
      if (error.message === 'DUPLICATE_DATE') {
        // Logika Popup Konfirmasi Jika Data Ganda
        Alert.alert(
          'Data Sudah Ada',
          'Anda sudah memasukkan data untuk HP ini di hari ini. Apakah Anda ingin menimpanya dengan nominal baru ini?',
          [
            { text: 'Batal', style: 'cancel' },
            { 
              text: 'Ya, Timpa Data', 
              onPress: async () => {
                await updateIncome(incomeData);
                Alert.alert('Sukses', 'Data pemasukan berhasil diperbarui!');
                queryClient.invalidateQueries({ queryKey: ['income'] });
                router.back();
              }
            }
          ]
        );
      } else {
        Alert.alert('Gagal', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><ChevronLeft size={24} /></TouchableOpacity>
        <Text style={styles.title}>Catat Pemasukan</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Pilih Perangkat</Text>
        {isLoadingDevices ? <ActivityIndicator size="small" color={COLORS.primary} style={{ alignSelf: 'flex-start' }} /> : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.deviceScroll} contentContainerStyle={{ gap: 10 }}>
            {activeDevices.map(device => (
              <Chip key={device.id} label={device.device_name} isActive={selectedDeviceId === device.id} onPress={() => setSelectedDeviceId(device.id)} />
            ))}
          </ScrollView>
        )}

        <Text style={styles.label}>Nominal Pemasukan (Hari Ini)</Text>
        <View style={styles.inputWrapper}>
          <Text style={styles.currency}>Rp</Text>
          <TextInput style={styles.input} keyboardType="number-pad" placeholder="0" value={amount} onChangeText={setAmount} />
        </View>

        <TouchableOpacity style={[styles.btnSave, loading && { opacity: 0.7 }]} onPress={handleSave} disabled={loading}>
          <Save color="#FFF" size={20} style={{ marginRight: 8 }} />
          <Text style={styles.btnText}>{loading ? 'Memproses...' : 'Simpan Pemasukan'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20 },
  title: { fontSize: 16, fontWeight: '700' },
  content: { padding: 20 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted, marginBottom: 12, marginTop: 15 },
  deviceScroll: { flexGrow: 0, marginBottom: 15 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 15, marginBottom: 30 },
  currency: { fontSize: 18, fontWeight: '700', marginRight: 10 },
  input: { flex: 1, paddingVertical: 15, fontSize: 20, fontWeight: '600' },
  btnSave: { backgroundColor: COLORS.primary, flexDirection: 'row', padding: 15, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: '700', fontSize: 16 }
});