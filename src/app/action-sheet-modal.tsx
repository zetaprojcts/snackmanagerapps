import { useRouter } from 'expo-router';
import { ArrowDownToLine, Smartphone, Wallet, X } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../theme';

export default function ActionSheetModal() {
  const router = useRouter();

  const navigateTo = (path: string) => {
    router.back(); // Tutup modal terlebih dahulu
    setTimeout(() => router.push(path as any), 100); // Baru pindah halaman
  };

  return (
    <View style={styles.container}>
      {/* Latar Belakang Gelap (Klik untuk menutup) */}
      <Pressable style={styles.backdrop} onPress={() => router.back()} />

      {/* Menu dari Bawah */}
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text style={styles.title}>Pilih Tindakan</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <X color={COLORS.textMuted} size={20} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('/add-device')}>
          <View style={[styles.iconBox, { backgroundColor: '#EEF2FF' }]}><Smartphone color={COLORS.primary} size={24} /></View>
          <Text style={styles.menuText}>Tambah Perangkat Baru</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('/add-income')}>
          <View style={[styles.iconBox, { backgroundColor: '#D1FAE5' }]}><ArrowDownToLine color={COLORS.success} size={24} /></View>
          <Text style={styles.menuText}>Catat Pemasukan Harian</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('/add-payment')}>
          <View style={[styles.iconBox, { backgroundColor: '#FEF3C7' }]}><Wallet color={COLORS.warning} size={24} /></View>
          <Text style={styles.menuText}>Catat Penarikan Saldo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)'
  },
  sheet: { backgroundColor: COLORS.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  closeBtn: { padding: 5, backgroundColor: COLORS.background, borderRadius: 12 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  iconBox: { padding: 12, borderRadius: 12, marginRight: 15 },
  menuText: { fontSize: 16, fontWeight: '600', color: COLORS.text }
});