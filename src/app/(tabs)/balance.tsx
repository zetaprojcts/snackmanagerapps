import { useQuery } from '@tanstack/react-query';
import { Activity, TrendingDown } from 'lucide-react-native';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fetchIncomes } from '../../features/income/api';
import { fetchPayments } from '../../features/payment/api';
import { COLORS } from '../../theme';

export default function BalanceScreen() {
  const { data: incomes, isLoading: loadingIncome, refetch: refetchIncome, isRefetching: isRefetchingIncome } = useQuery({ queryKey: ['income'], queryFn: fetchIncomes });
  const { data: payments, isLoading: loadingPayment, refetch: refetchPayment, isRefetching: isRefetchingPayment } = useQuery({ queryKey: ['payment'], queryFn: fetchPayments });

  // 1. Kalkulasi Total Pemasukan
  const totalIncome = incomes?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
  
  // 2. Kalkulasi Penarikan (Kotor, Admin, dan Bersih)
  const totalGrossPayment = payments?.reduce((acc, curr) => acc + Number(curr.gross_amount), 0) || 0;
  const totalAdminFee = payments?.reduce((acc, curr) => acc + Number(curr.admin_fee), 0) || 0;
  const totalNetPayment = payments?.reduce((acc, curr) => acc + Number(curr.net_amount), 0) || 0;

  // 3. Kalkulasi Mutlak: Saldo Bersih Aktual (Pemasukan - Penarikan Kotor)
  const netBalance = totalIncome - totalGrossPayment;

  const onRefresh = () => {
    refetchIncome();
    refetchPayment();
  };

  const isLoading = loadingIncome || loadingPayment;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isRefetchingIncome || isRefetchingPayment} onRefresh={onRefresh} />}
    >
      <Text style={styles.pageTitle}>Dashboard</Text>

      {/* Baris 1: Hero Card (Total Saldo) */}
      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>Total Saldo Bersih</Text>
        <Text style={styles.heroAmount}>Rp {isLoading ? '...' : netBalance.toLocaleString('id-ID')}</Text>
      </View>

      {/* Baris 2: Stat Cards */}
      <View style={styles.statsContainer}>
        {/* Kiri: Pemasukan */}
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Pemasukan</Text>
          <Text style={styles.statAmount}>{isLoading ? '...' : (totalIncome / 1000).toFixed(0)}K</Text>
          <View style={styles.trendRow}>
            <Activity size={12} color={COLORS.success} />
            <Text style={[styles.trendText, { color: COLORS.success }]}>Lihat Tren</Text>
          </View>
        </View>

        {/* Tengah: Cair Bersih */}
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Cair (Net)</Text>
          <Text style={styles.statAmount}>{isLoading ? '...' : (totalNetPayment / 1000).toFixed(0)}K</Text>
          <View style={styles.trendRow}>
            <Activity size={12} color={COLORS.primary} />
            <Text style={[styles.trendText, { color: COLORS.primary }]}>Cair Aktif</Text>
          </View>
        </View>

        {/* Kanan: Biaya Admin */}
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Admin Fee</Text>
          <Text style={styles.statAmount}>{isLoading ? '...' : (totalAdminFee / 1000).toFixed(0)}K</Text>
          <View style={styles.trendRow}>
            <TrendingDown size={12} color={COLORS.danger} />
            <Text style={[styles.trendText, { color: COLORS.danger }]}>Menguap</Text>
          </View>
        </View>
      </View>

      <View style={{ marginTop: 30 }}>
        <Text style={{ color: COLORS.textMuted, fontSize: 13, lineHeight: 20 }}>
          <Text style={{ fontWeight: '700' }}>Catatan Sistem:</Text> Saldo Bersih dihitung dari Total Pemasukan dikurangi Total Penarikan Kotor. Angka K pada metrik adalah singkatan dari Ribuan.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingTop: 60, paddingHorizontal: 20 },
  pageTitle: { fontSize: 24, fontWeight: '700', marginBottom: 20 },
  heroCard: { backgroundColor: COLORS.primary, padding: 24, borderRadius: 16, marginBottom: 20, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
  heroLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 8, fontWeight: '500' },
  heroAmount: { color: '#FFF', fontSize: 32, fontWeight: '700' },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  statBox: { width: '31%', backgroundColor: COLORS.card, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  statLabel: { fontSize: 11, color: COLORS.textMuted, marginBottom: 6, fontWeight: '600' },
  statAmount: { fontSize: 15, fontWeight: '700', marginBottom: 8, color: COLORS.text },
  trendRow: { flexDirection: 'row', alignItems: 'center' },
  trendText: { fontSize: 10, fontWeight: '700', marginLeft: 4 }
});