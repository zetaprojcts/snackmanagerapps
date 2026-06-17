import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { ChevronLeft, Save } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { Chip } from '../components/ui/Chip';
import { addDevice, generateNextDeviceCode } from '../features/devices/api';
import { COLORS } from '../theme';

const WALLETS = ['Dana', 'OVO', 'GoPay', 'ShopeePay'];

export default function AddDevice() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [form, setForm] = useState({
    code: 'Memuat...', 
    device_name: '',
    phone_number: '',
    email: '',
    ewallet: 'Dana',
    status: 'active'
  });

  // Ambil kode HP otomatis saat halaman dibuka
  useEffect(() => {
    const fetchNextCode = async () => {
      try {
        const nextCode = await generateNextDeviceCode();
        setForm(prev => ({ ...prev, code: nextCode }));
      } catch (error) {
        console.error("Gagal memuat kode otomatis", error);
        setForm(prev => ({ ...prev, code: '' })); 
      }
    };
    
    fetchNextCode();
  }, []);

  // Mutasi ke Supabase
  const mutation = useMutation({
    mutationFn: addDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      Alert.alert('Sukses', 'Perangkat baru berhasil ditambahkan!');
      router.back();
    },
    onError: (error: any) => {
      Alert.alert('Gagal', error.message);
    }
  });

  const handleSave = () => {
    if (!form.code || form.code === 'Memuat...') {
      Alert.alert('Error', 'Tunggu hingga kode perangkat selesai dimuat, atau isi secara manual.');
      return;
    }
    if (!form.device_name) {
      Alert.alert('Error', 'Nama Perangkat wajib diisi!');
      return;
    }
    mutation.mutate(form);
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.title}>Tambah Perangkat</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        
        {/* Toggle Status Operasional */}
        <View style={styles.switchContainer}>
          <View style={styles.switchTextContainer}>
            <Text style={styles.switchTitle}>Status Awal</Text>
            <Text style={[
              styles.switchSubtitle, 
              { color: form.status === 'active' ? '#4CAF50' : '#F44336' }
            ]}>
              {form.status === 'active' ? '● Perangkat Aktif' : '● Perangkat Tidak Aktif'}
            </Text>
          </View>
          <Switch
            value={form.status === 'active'}
            onValueChange={(val) => setForm({...form, status: val ? 'active' : 'inactive'})}
            trackColor={{ false: '#FFEBEE', true: '#E8F5E9' }}
            thumbColor={form.status === 'active' ? '#4CAF50' : '#F44336'}
          />
        </View>

        <Text style={styles.label}>Kode Perangkat (Otomatis)</Text>
        <TextInput 
          style={styles.input} 
          value={form.code} 
          onChangeText={(t) => setForm({...form, code: t})} 
          placeholder="Contoh: HP001"
        />

        <Text style={styles.label}>Nama Perangkat</Text>
        <TextInput 
          style={styles.input} 
          value={form.device_name} 
          onChangeText={(t) => setForm({...form, device_name: t})} 
          placeholder="Contoh: Samsung A54"
        />

        <Text style={styles.label}>Pilih E-Wallet Utama</Text>
        <View style={styles.chipContainer}>
          {WALLETS.map((wallet) => (
            <Chip 
              key={wallet} 
              label={wallet} 
              isActive={form.ewallet === wallet} 
              onPress={() => setForm({...form, ewallet: wallet})} 
            />
          ))}
        </View>

        <Text style={styles.label}>Nomor Telepon (Opsional)</Text>
        <TextInput 
          style={styles.input} 
          keyboardType="phone-pad" 
          value={form.phone_number} 
          onChangeText={(t) => setForm({...form, phone_number: t})} 
          placeholder="Contoh: 08123456789"
        />

        <Text style={styles.label}>Email (Opsional)</Text>
        <TextInput 
          style={styles.input} 
          keyboardType="email-address" 
          value={form.email} 
          autoCapitalize="none"
          onChangeText={(t) => setForm({...form, email: t})} 
          placeholder="Contoh: hp1@email.com"
        />

        <TouchableOpacity 
          style={[styles.btnSave, mutation.isPending && { opacity: 0.7 }]} 
          onPress={handleSave} 
          disabled={mutation.isPending}
        >
          <Save color="#FFF" size={20} style={{ marginRight: 8 }} />
          <Text style={styles.btnText}>
            {mutation.isPending ? 'Menyimpan...' : 'Simpan Perangkat'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background, 
    paddingTop: 50 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20
  },
  title: { 
    fontSize: 18, 
    fontWeight: '700',
    color: '#1A1A1A'
  },
  content: { 
    padding: 20 
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  switchTextContainer: {
    flex: 1,
  },
  switchTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  switchSubtitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  label: { 
    fontSize: 13, 
    fontWeight: '600', 
    color: COLORS.textMuted, 
    marginBottom: 8, 
    marginTop: 10 
  },
  input: { 
    backgroundColor: '#FFFFFF', 
    borderWidth: 1, 
    borderColor: COLORS.border, 
    borderRadius: 12, 
    padding: 15, 
    fontSize: 15,
    color: '#1A1A1A'
  },
  chipContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 10, 
    marginTop: 5,
    marginBottom: 10
  },
  btnSave: { 
    backgroundColor: COLORS.primary, 
    flexDirection: 'row', 
    padding: 15, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 40,
    marginBottom: 40
  },
  btnText: { 
    color: '#FFF', 
    fontWeight: '700', 
    fontSize: 16 
  }
});