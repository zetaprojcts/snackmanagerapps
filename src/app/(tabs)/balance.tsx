import { useQuery } from "@tanstack/react-query";
import { ArrowDownToLine, ArrowUpToLine, Filter, Wallet } from "lucide-react-native";
import React, { useMemo, useState } from "react";

import {
  LayoutAnimation,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";

import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";

import {
  BalanceCardSkeleton,
  TransactionCardSkeleton,
} from "../../components/ui/Skeleton";

import { fetchIncomes } from "../../features/income/api";
import { fetchPayments } from "../../features/payment/api";

import { COLORS, SHADOW } from "../../theme";

// Mengaktifkan LayoutAnimation untuk Android
if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export default function BalanceScreen() {
  const [activityFilter, setActivityFilter] = useState<"all" | "income" | "payment">("all");
  const [showActivityMenu, setShowActivityMenu] = useState(false);

  const {
    data: incomes,
    isLoading: loadingIncome,
    refetch: refetchIncome,
    isRefetching: isRefetchingIncome,
  } = useQuery({
    queryKey: ["income"],
    queryFn: fetchIncomes,
  });

  const {
    data: payments,
    isLoading: loadingPayment,
    refetch: refetchPayment,
    isRefetching: isRefetchingPayment,
  } = useQuery({
    queryKey: ["payment"],
    queryFn: fetchPayments,
  });

  const animateLayout = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const totalIncome =
    incomes?.reduce((total: number, item: any) => total + Number(item.amount), 0) || 0;

  const totalGrossPayment =
    payments?.reduce((total: number, item: any) => total + Number(item.gross_amount), 0) || 0;

  const totalAdminFee =
    payments?.reduce((total: number, item: any) => total + Number(item.admin_fee), 0) || 0;

  // REVISI: Total Penarikan yang tampil adalah setelah dipotong biaya admin
  const totalNetPayment = totalGrossPayment - totalAdminFee;

  // Total saldo utama tetap menggunakan gross payment sebagai pengurang
  const netBalance = totalIncome - totalGrossPayment;

  const recentActivities = useMemo(() => {
    const incomeActivities =
      incomes?.map((item: any) => ({
        type: "income",
        amount: Number(item.amount),
        trx_date: item.trx_date,
        device_name: item.devices?.device_name ?? "Perangkat",
      })) || [];

    const paymentActivities =
      payments?.map((item: any) => ({
        type: "payment",
        amount: Number(item.gross_amount),
        trx_date: item.trx_date,
        device_name: item.devices?.device_name ?? "Perangkat",
      })) || [];

    let merged = [...incomeActivities, ...paymentActivities];

    if (activityFilter === "income") {
      merged = incomeActivities;
    }

    if (activityFilter === "payment") {
      merged = paymentActivities;
    }

    return merged
      // REVISI: Urutan menurun (terbaru di atas)
      .sort((a, b) => new Date(b.trx_date).getTime() - new Date(a.trx_date).getTime())
      // REVISI: Maksimal 7 transaksi terakhir
      .slice(0, 7);
  }, [incomes, payments, activityFilter]);

  const onRefresh = () => {
    refetchIncome();
    refetchPayment();
  };

  const isLoading = loadingIncome || loadingPayment;

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Dashboard Saldo</Text>
        </View>

        <View style={{ marginHorizontal: 20 }}>
          <BalanceCardSkeleton />
        </View>

        <View style={{ height: 16 }} />

        <View style={{ marginHorizontal: 20 }}>
          <BalanceCardSkeleton />
        </View>

        <View style={styles.activitySectionSkeleton}>
          <View style={styles.activityHeader}>
            <View style={{ width: 140, height: 20, backgroundColor: '#E5E7EB', borderRadius: 6 }} />
            <View style={{ width: 24, height: 24, backgroundColor: '#E5E7EB', borderRadius: 6 }} />
          </View>
          <TransactionCardSkeleton />
          <TransactionCardSkeleton />
          <TransactionCardSkeleton />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown} style={styles.header}>
        <Text style={styles.pageTitle}>Dashboard Saldo</Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(100)} style={styles.heroCard}>
        {/* REVISI: Icon e-wallet pada Hero Card (Kanan) */}
        <View style={styles.heroContent}>
          <View>
            <Text style={styles.heroLabel}>Total Saldo</Text>
            <Text style={styles.heroAmount}>
              Rp {netBalance.toLocaleString("id-ID")}
            </Text>
          </View>
          <View style={styles.heroIconWrapper}>
            <Wallet size={42} color="#FFFFFF" opacity={0.3} />
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(150)} style={styles.cardRow}>
        <View style={styles.statCard}>
          <View style={[styles.iconBox, { backgroundColor: "#D1FAE5" }]}>
            <ArrowDownToLine size={16} color={COLORS.success} />
          </View>
          <Text style={styles.cardLabel}>Pendapatan</Text>
          <Text style={styles.cardValueIncome}>
            + Rp {totalIncome.toLocaleString("id-ID")}
          </Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.iconBox, { backgroundColor: "#ffd0d0" }]}>
            {/* REVISI: Mengubah Icon menjadi ArrowUpToLine (Panah ke Atas) */}
            <ArrowUpToLine size={16} color={COLORS.danger} />
          </View>
          <Text style={styles.cardLabel}>Penarikan</Text>
          <Text style={styles.cardValuePayment}>
            {/* REVISI: Nominal yang tampil adalah setelah dipotong admin */}
            - Rp {totalNetPayment.toLocaleString("id-ID")}
          </Text>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(200)} style={styles.activitySection}>
        {/* REVISI: Header Aktivitas & Tombol Filter Dropdown */}
        <View style={styles.activityHeaderContainer}>
          <View style={styles.activityHeader}>
            <Text style={styles.sectionTitle}>Aktivitas Terbaru</Text>

            <TouchableOpacity
              style={styles.activityFilterBtn}
              onPress={() => {
                animateLayout();
                setShowActivityMenu(!showActivityMenu);
              }}
            >
              <Filter size={18} color={activityFilter !== "all" ? COLORS.primary : COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Efek FadeIn untuk Toast Menu */}
          {showActivityMenu && (
            <Animated.View entering={FadeInUp.duration(200)} style={styles.dropdownMenu}>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => { animateLayout(); setActivityFilter("all"); setShowActivityMenu(false); }}
              >
                <Text style={[styles.dropdownText, activityFilter === "all" && styles.dropdownTextActive]}>Semua</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => { animateLayout(); setActivityFilter("income"); setShowActivityMenu(false); }}
              >
                <Text style={[styles.dropdownText, activityFilter === "income" && styles.dropdownTextActive]}>Pemasukan</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dropdownItem, { borderBottomWidth: 0 }]}
                onPress={() => { animateLayout(); setActivityFilter("payment"); setShowActivityMenu(false); }}
              >
                <Text style={[styles.dropdownText, activityFilter === "payment" && styles.dropdownTextActive]}>Penarikan</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetchingIncome || isRefetchingPayment}
              onRefresh={onRefresh}
            />
          }
        >
          {recentActivities.length === 0 ? (
            <Animated.View entering={FadeIn.duration(300)} style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Belum Ada Aktivitas</Text>
              <Text style={styles.emptySubtitle}>
                Tidak ada data {activityFilter === 'income' ? 'pemasukan' : activityFilter === 'payment' ? 'penarikan' : 'transaksi'}
              </Text>
            </Animated.View>
          ) : (
            recentActivities.map((item, index) => (
              <Animated.View
                key={`${item.type}-${item.trx_date}-${index}`}
                entering={FadeInUp.duration(300).delay(index * 40)}
                style={styles.activityCard}
              >
                <View
                  style={[
                    styles.activityIcon,
                    {
                      backgroundColor: item.type === "income" ? "#D1FAE5" : "#ffd0d0",
                    },
                  ]}
                >
                  {/* REVISI: Icon Aktivitas Penarikan diubah menjadi ArrowUpToLine dan diselaraskan warnanya */}
                  {item.type === "income" ? (
                    <ArrowDownToLine size={18} color={COLORS.success} />
                  ) : (
                    <ArrowUpToLine size={18} color={COLORS.danger} />
                  )}
                </View>

                <View style={styles.activityContent}>
                  <Text style={styles.activityDevice}>
                    {item.device_name}
                  </Text>
                  <Text style={styles.activityDate}>
                    {new Date(item.trx_date).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.activityAmount,
                    {
                      color: item.type === "income" ? COLORS.success : COLORS.danger,
                    },
                  ]}
                >
                  {item.type === "income" ? "+" : "-"} Rp{" "}
                  {item.amount.toLocaleString("id-ID")}
                </Text>
              </Animated.View>
            ))
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.text,
  },
  heroCard: {
    marginHorizontal: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    padding: 24,
    ...SHADOW.card,
    elevation: 8,
  },
  heroContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroIconWrapper: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 12,
    borderRadius: 18,
  },
  heroLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    marginBottom: 6,
  },
  heroAmount: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
  },
  cardRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    ...SHADOW.card,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  cardValueIncome: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primary,
  },
  cardValuePayment: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.danger,
  },
  activitySectionSkeleton: {
    paddingHorizontal: 20,
    marginTop: 24,
    flex: 1,
  },
  activitySection: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 24,
  },
  activityHeaderContainer: {
    zIndex: 99,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  activityFilterBtn: {
    padding: 6,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 36,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: 130,
    ...SHADOW.card,
    elevation: 5,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownText: {
    fontSize: 14,
    color: COLORS.text,
  },
  dropdownTextActive: {
    fontWeight: "700",
    color: COLORS.primary,
  },
  activityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    ...SHADOW.card,
  },
  activityIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  activityContent: {
    flex: 1,
    marginLeft: 12,
  },
  activityDevice: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },
  activityDate: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 3,
  },
  activityAmount: {
    fontSize: 14,
    fontWeight: "700",
  },
  emptyState: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 40,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
});
