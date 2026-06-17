import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { FilterPills } from '../../components/layout/FilterPills';
import { TransactionCard } from '../../components/ui/TransactionCard';
import { fetchPayments } from '../../features/payment/api';
import { COLORS } from '../../theme';

export default function PaymentScreen() {
  const [filter, setFilter] = useState('Bulan Ini');
  
  const { data: payments, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['payment'],
    queryFn: fetchPayments,
  });

  // Logika Filter Waktu
  const getFilteredData = () => {
    if (!payments) return [];
    const now = new Date();
    
    return payments.filter(item => {
      const itemDate = new Date(item.trx_date);
      if (filter === '7 Hari Terakhir') {
        const diff = now.getTime() - itemDate.getTime();
        return diff <= 7 * 24 * 60 * 60 * 1000;
      } else if (filter === 'Bulan Ini') {
        return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
      } else if (filter === '3 Bulan Terakhir') {
        const diff = now.getTime() - itemDate.getTime();
        return diff <= 90 * 24 * 60 * 60 * 1000;
      }
      return true;
    });
  };

  const filteredPayments = getFilteredData();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Riwayat Penarikan</Text>
      
      <View style={{ paddingHorizontal: 20 }}>
        <FilterPills activeFilter={filter} setFilter={setFilter} />
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredPayments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshing={isRefetching}
          onRefresh={refetch}
          ListEmptyComponent={<Text style={styles.emptyText}>Belum ada riwayat penarikan untuk periode ini.</Text>}
          renderItem={({ item }) => (
            <TransactionCard 
              type="payment"
              deviceName={item.devices?.device_name || 'Perangkat Dihapus'}
              date={item.trx_date}
              amount={item.gross_amount} 
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: '700', marginHorizontal: 20, marginBottom: 20 },
  list: { paddingHorizontal: 20, paddingBottom: 20 },
  emptyText: { textAlign: 'center', marginTop: 50, color: COLORS.textMuted }
});