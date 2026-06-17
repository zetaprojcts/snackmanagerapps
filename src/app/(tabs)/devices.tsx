import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { ChevronRight, ServerCrash, Smartphone } from 'lucide-react-native';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { Badge } from '../../components/ui/Badge';
import { COLORS } from '../../theme';
// Pastikan Anda sudah membuat fungsi getDevices di api.ts
import { getDevices } from '../../features/devices/api';

export default function DevicesScreen() {
  const router = useRouter();

  // Mengambil data perangkat dari Supabase
  const { data: devices, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['devices'],
    queryFn: getDevices,
  });

  // Tampilan saat data sedang dimuat pertama kali
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Memuat data perangkat...</Text>
      </View>
    );
  }

  // Tampilan jika terjadi eror koneksi
  if (isError) {
    return (
      <View style={styles.centerContainer}>
        <ServerCrash size={48} color={COLORS.textMuted} />
        <Text style={styles.errorText}>Gagal memuat data perangkat.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryText}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Komponen untuk setiap kartu perangkat
  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card}
      activeOpacity={0.7}
      // Membuka halaman detail perangkat sambil mengirimkan parameter ID
      onPress={() => router.push(`/device-detail?id=${item.id}`)}
    >
      <View style={styles.iconContainer}>
        <Smartphone color={COLORS.primary} size={28} />
      </View>
      
      <View style={styles.cardContent}>
        <Text style={styles.deviceName}>{item.device_name}</Text>
        <Text style={styles.deviceCode}>Kode: {item.code}</Text>
        
        {/* Pemasangan Badge Status di Sini */}
        <View style={styles.badgeWrapper}>
          <Badge status={item.status || 'active'} />
        </View>
      </View>

      <ChevronRight color={COLORS.border} size={24} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Daftar Perangkat</Text>
        <Text style={styles.headerSubtitle}>Kelola semua HP operasional Anda</Text>
      </View>

      <FlatList
        data={devices}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        // Fitur tarik ke bawah untuk refresh data (Pull-to-Refresh)
        refreshControl={
          <RefreshControl 
            refreshing={isRefetching} 
            onRefresh={refetch} 
            colors={[COLORS.primary]} 
          />
        }
        // Tampilan jika database masih kosong
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Smartphone size={64} color={COLORS.border} />
            <Text style={styles.emptyTitle}>Belum Ada Perangkat</Text>
            <Text style={styles.emptySubtitle}>
              Tekan tombol "+" di bawah untuk menambahkan perangkat baru.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100, // Memberi ruang agar tidak tertutup navbar & FAB
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    // Efek shadow tipis
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F4FF', // Warna latar belakang ikon (biru sangat muda)
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  deviceCode: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  badgeWrapper: {
    alignSelf: 'flex-start',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 30,
    lineHeight: 20,
  },
});