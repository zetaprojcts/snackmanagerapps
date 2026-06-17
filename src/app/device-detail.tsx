import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, CreditCard, Edit, Hash, Mail, Phone, Smartphone } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { FilterPills } from '../components/layout/FilterPills';
import { getDeviceById, getDeviceTransactions } from '../features/devices/api';
import { COLORS } from '../theme';

export default function DeviceDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [timeFilter, setTimeFilter] = useState('7 Hari Terakhir');
  const [metricTab, setMetricTab] = useState('Pemasukan'); 

  // Ambil data profil HP
  const { data: device, isLoading: loadingDevice } = useQuery({
    queryKey: ['device', id],
    queryFn: () => getDeviceById(id as string),
  });

  // Ambil data transaksi khusus HP ini
  const { data: transactions, isLoading: loadingTrx } = useQuery({
    queryKey: ['device-trx', id],
    queryFn: () => getDeviceTransactions(id as string),
  });

  if (loadingDevice || loadingTrx) return <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 100 }} />;
  if (!device) return <Text style={{ textAlign: 'center', marginTop: 100 }}>Perangkat tidak ditemukan.</Text>;

  // --- LOGIKA FILTER WAKTU ---
  const filterDataByTime = (data: any[]) => {
    const now = new Date();
    return data.filter(item => {
      const itemDate = new Date(item.trx_date);
      if (timeFilter === '7 Hari Terakhir') {
        const diff = now.getTime() - itemDate.getTime();
        return diff <= 7 * 24 * 60 * 60 * 1000;
      } else if (timeFilter === 'Bulan Ini') {
        return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
      } else if (timeFilter === '3 Bulan Terakhir') {
        const diff = now.getTime() - itemDate.getTime();
        return diff <= 90 * 24 * 60 * 60 * 1000;
      }
      return true;
    });
  };

  // --- LOGIKA DATA GRAFIK ---
  const isIncome = metricTab === 'Pemasukan';
  const rawData = isIncome ? (transactions?.incomes || []) : (transactions?.payments || []);
  const filteredData = filterDataByTime(rawData);

  // Format data untuk react-native-gifted-charts
  const chartData = filteredData.map(d => ({
    value: isIncome ? Number(d.amount) : Number(d.gross_amount),
    label: new Date(d.trx_date).getDate().toString(), // Ambil tanggalnya saja (misal: "17")
    frontColor: isIncome ? COLORS.success : COLORS.warning,
  }));

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><ChevronLeft size={24} /></TouchableOpacity>
        <Text style={styles.title}>Detail Perangkat</Text>
        <TouchableOpacity onPress={() => router.push({ pathname: '/edit-device', params: { id } })}>
          <Edit size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Hero Card & Info Sistem */}
      <View style={styles.heroCard}>
        <View style={styles.heroIcon}><Smartphone color={COLORS.primary} size={40} /></View>
        <Text style={styles.heroName}>{device.device_name}</Text>
        <View style={[styles.badge, !device.is_active && styles.badgeInactive]}>
          <Text style={[styles.badgeText, !device.is_active && styles.badgeTextInactive]}>
            {device.is_active ? 'Status Aktif' : 'Tidak Aktif'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}><Hash size={16} color={COLORS.textMuted} /><Text style={styles.infoText}>{device.code}</Text></View>
          <View style={styles.infoRow}><CreditCard size={16} color={COLORS.textMuted} /><Text style={styles.infoText}>E-Wallet: {device.ewallet}</Text></View>
          {device.phone_number ? <View style={styles.infoRow}><Phone size={16} color={COLORS.textMuted} /><Text style={styles.infoText}>{device.phone_number}</Text></View> : null}
          {device.email ? <View style={styles.infoRow}><Mail size={16} color={COLORS.textMuted} /><Text style={styles.infoText}>{device.email}</Text></View> : null}
        </View>
      </View>

      {/* Analitik Performa (Grafik Aktif) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Analitik Performa</Text>
        
        <View style={styles.metricTabs}>
          <TouchableOpacity onPress={() => setMetricTab('Pemasukan')} style={[styles.metricTab, isIncome && styles.metricTabActive]}>
            <Text style={[styles.metricText, isIncome && styles.metricTextActive]}>Pemasukan</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMetricTab('Penarikan')} style={[styles.metricTab, !isIncome && styles.metricTabActive]}>
            <Text style={[styles.metricText, !isIncome && styles.metricTextActive]}>Penarikan</Text>
          </TouchableOpacity>
        </View>

        <FilterPills activeFilter={timeFilter} setFilter={setTimeFilter} />

        <View style={styles.chartArea}>
          {chartData.length > 0 ? (
            <BarChart
              data={chartData}
              barWidth={28}
              spacing={15}
              roundedTop
              xAxisThickness={1}
              yAxisThickness={0}
              yAxisTextStyle={{ color: COLORS.textMuted, fontSize: 10 }}
              xAxisLabelTextStyle={{ color: COLORS.textMuted, fontSize: 10 }}
              noOfSections={4}
              formatYLabel={(label) => (Number(label) / 1000).toFixed(0) + 'K'} // Format angka ribuan
              height={180}
              isAnimated
            />
          ) : (
             <Text style={styles.emptyChartText}>Belum ada data untuk periode ini.</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 10 },
  title: { fontSize: 16, fontWeight: '700' },
  heroCard: { alignItems: 'center', marginVertical: 15 },
  heroIcon: { backgroundColor: '#EEF2FF', padding: 20, borderRadius: 99, marginBottom: 15 },
  heroName: { fontSize: 24, fontWeight: '700', marginBottom: 10 },
  badge: { backgroundColor: '#D1FAE5', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  badgeInactive: { backgroundColor: '#FEE2E2' },
  badgeText: { color: COLORS.success, fontSize: 12, fontWeight: '700' },
  badgeTextInactive: { color: COLORS.danger },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  infoCard: { backgroundColor: COLORS.card, padding: 15, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, gap: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoText: { fontSize: 14, color: COLORS.text, fontWeight: '500' },
  metricTabs: { flexDirection: 'row', backgroundColor: COLORS.card, borderRadius: 8, padding: 4, marginBottom: 15, borderWidth: 1, borderColor: COLORS.border },
  metricTab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  metricTabActive: { backgroundColor: COLORS.primary },
  metricText: { color: COLORS.textMuted, fontWeight: '600', fontSize: 13 },
  metricTextActive: { color: '#FFF' },
  chartArea: { backgroundColor: COLORS.card, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, padding: 20, paddingTop: 30, overflow: 'hidden' },
  emptyChartText: { color: COLORS.textMuted, textAlign: 'center', marginVertical: 40 }
});