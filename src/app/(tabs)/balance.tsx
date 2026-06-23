import { useQuery } from "@tanstack/react-query";
import {
  ArrowDownToLine,
  ArrowUpToLine,
  Filter,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react-native";
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

import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";

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
  const [activityFilter, setActivityFilter] = useState<
    "all" | "income" | "payment"
  >("all");
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

  // Kalkulasi Saldo Utama
  const totalIncome =
    incomes?.reduce(
      (total: number, item: any) => total + Number(item.amount),
      0,
    ) || 0;

  const totalGrossPayment =
    payments?.reduce(
      (total: number, item: any) => total + Number(item.gross_amount),
      0,
    ) || 0;

  const totalAdminFee =
    payments?.reduce(
      (total: number, item: any) => total + Number(item.admin_fee),
      0,
    ) || 0;

  const totalNetPayment = totalGrossPayment - totalAdminFee;
  const netBalance = totalIncome - totalGrossPayment;

  // FITUR BARU: Kalkulasi Bulan Ini & Komparasi
  const monthlyStats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastMonthYear = lastMonthDate.getFullYear();

    let incomeThisMonth = 0;
    let incomeLastMonth = 0;
    let paymentThisMonth = 0;
    let paymentLastMonth = 0;

    incomes?.forEach((item: any) => {
      const amt = Number(item.amount || 0);
      if (item.trx_date) {
        const d = new Date(item.trx_date);
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear)
          incomeThisMonth += amt;
        if (d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear)
          incomeLastMonth += amt;
      }
    });

    payments?.forEach((item: any) => {
      // Menggunakan Net Amount (Gross - Admin) untuk perhitungan bulanan
      const netAmt =
        Number(item.gross_amount || 0) - Number(item.admin_fee || 0);
      if (item.trx_date) {
        const d = new Date(item.trx_date);
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear)
          paymentThisMonth += netAmt;
        if (d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear)
          paymentLastMonth += netAmt;
      }
    });

    const calculatePercentage = (thisMonth: number, lastMonth: number) => {
      if (lastMonth === 0) return thisMonth > 0 ? 100 : 0;
      return ((thisMonth - lastMonth) / lastMonth) * 100;
    };

    return {
      incomeThisMonth,
      paymentThisMonth,
      incomePercentage: calculatePercentage(incomeThisMonth, incomeLastMonth),
      paymentPercentage: calculatePercentage(
        paymentThisMonth,
        paymentLastMonth,
      ),
    };
  }, [incomes, payments]);

  // Kalkulasi Aktivitas Terbaru
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

    if (activityFilter === "income") merged = incomeActivities;
    if (activityFilter === "payment") merged = paymentActivities;

    return merged
      .sort(
        (a, b) =>
          new Date(b.trx_date).getTime() - new Date(a.trx_date).getTime(),
      )
      .slice(0, 10);
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
            <View
              style={{
                width: 140,
                height: 20,
                backgroundColor: "#E5E7EB",
                borderRadius: 6,
              }}
            />
            <View
              style={{
                width: 24,
                height: 24,
                backgroundColor: "#E5E7EB",
                borderRadius: 6,
              }}
            />
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
        <View style={styles.heroContent}>
          <View>
            <Text style={styles.heroLabel}>Total Saldo</Text>
            <Text style={styles.heroAmount}>
              Rp {netBalance.toLocaleString("id-ID")}
            </Text>
          </View>
          <View style={styles.heroIconWrapper}>
            <Wallet size={42} color={COLORS.softBlue} />
          </View>
        </View>
      </Animated.View>

      {/* REVISI: Tata Letak Card Sejajar Kiri-Kanan & Persentase */}
      <Animated.View entering={FadeInUp.delay(150)} style={styles.gridColumn}>
        {/* CARD PENDAPATAN */}
        <View style={styles.summaryCard}>
          <View style={styles.cardFlexRow}>
            <View style={styles.iconBox}>
              <ArrowDownToLine size={26} color={COLORS.success} />
            </View>
            <View style={styles.textFlexContainer}>
              <Text style={styles.cardLabel}>Pendapatan</Text>
              <Text style={styles.cardValueIncome}>
                + Rp {monthlyStats.incomeThisMonth.toLocaleString("id-ID")}
              </Text>
              <View style={styles.comparisonRow}>
                {monthlyStats.incomePercentage >= 0 ? (
                  <TrendingUp
                    size={12}
                    color={COLORS.success}
                    style={{ marginRight: 4 }}
                  />
                ) : (
                  <TrendingDown
                    size={12}
                    color={COLORS.danger}
                    style={{ marginRight: 4 }}
                  />
                )}
                <Text
                  style={[
                    styles.comparisonText,
                    {
                      color:
                        monthlyStats.incomePercentage >= 0
                          ? COLORS.success
                          : COLORS.danger,
                    },
                  ]}
                >
                  {monthlyStats.incomePercentage > 0 ? "+" : ""}
                  {monthlyStats.incomePercentage.toFixed(1)}%
                </Text>
                <Text style={styles.comparisonLabel}> Bulan lalu</Text>
              </View>
            </View>
          </View>
        </View>

        {/* CARD PENARIKAN */}
        <View style={styles.summaryCard}>
          <View style={styles.cardFlexRow}>
            <View style={styles.iconBox}>
              <ArrowUpToLine size={26} color={COLORS.warning} />
            </View>
            <View style={styles.textFlexContainer}>
              <Text style={styles.cardLabel}>Penarikan</Text>
              <Text style={styles.cardValuePayment}>
                - Rp {monthlyStats.paymentThisMonth.toLocaleString("id-ID")}
              </Text>
              <View style={styles.comparisonRow}>
                {monthlyStats.paymentPercentage <= 0 ? (
                  <TrendingDown
                    size={12}
                    color={COLORS.success}
                    style={{ marginRight: 4 }}
                  />
                ) : (
                  <TrendingUp
                    size={12}
                    color={COLORS.danger}
                    style={{ marginRight: 4 }}
                  />
                )}
                <Text
                  style={[
                    styles.comparisonText,
                    {
                      color:
                        monthlyStats.paymentPercentage <= 0
                          ? COLORS.success
                          : COLORS.danger,
                    },
                  ]}
                >
                  {monthlyStats.paymentPercentage > 0 ? "+" : ""}
                  {monthlyStats.paymentPercentage.toFixed(1)}%
                </Text>
                <Text style={styles.comparisonLabel}> Bulan lalu</Text>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>

      <Animated.View
        entering={FadeInUp.delay(200)}
        style={styles.activitySection}
      >
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
              <Filter
                size={18}
                color={
                  activityFilter !== "all" ? COLORS.primary : COLORS.textMuted
                }
              />
            </TouchableOpacity>
          </View>

          {showActivityMenu && (
            <Animated.View
              entering={FadeInUp.duration(200)}
              style={styles.dropdownMenu}
            >
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  animateLayout();
                  setActivityFilter("all");
                  setShowActivityMenu(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    activityFilter === "all" && styles.dropdownTextActive,
                  ]}
                >
                  Semua
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  animateLayout();
                  setActivityFilter("income");
                  setShowActivityMenu(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    activityFilter === "income" && styles.dropdownTextActive,
                  ]}
                >
                  Pemasukan
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dropdownItem, { borderBottomWidth: 0 }]}
                onPress={() => {
                  animateLayout();
                  setActivityFilter("payment");
                  setShowActivityMenu(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    activityFilter === "payment" && styles.dropdownTextActive,
                  ]}
                >
                  Penarikan
                </Text>
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
            <Animated.View
              entering={FadeIn.duration(300)}
              style={styles.emptyState}
            >
              <Text style={styles.emptyTitle}>Belum Ada Aktivitas</Text>
              <Text style={styles.emptySubtitle}>
                Tidak ada data{" "}
                {activityFilter === "income"
                  ? "pemasukan"
                  : activityFilter === "payment"
                    ? "penarikan"
                    : "transaksi"}
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
                      backgroundColor:
                        item.type === "income"
                          ? COLORS.softGreen
                          : COLORS.softYellow,
                    },
                  ]}
                >
                  {item.type === "income" ? (
                    <ArrowDownToLine size={18} color={COLORS.success} />
                  ) : (
                    <ArrowUpToLine size={18} color={COLORS.warning} />
                  )}
                </View>

                <View style={styles.activityContent}>
                  <Text style={styles.activityDevice}>{item.device_name}</Text>
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
                      color:
                        item.type === "income"
                          ? COLORS.success
                          : COLORS.warning,
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
    marginBottom: 16,
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
  },
  heroContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroIconWrapper: {
    backgroundColor: "rgba(89, 133, 245, 0.81)",
    padding: 12,
    borderRadius: 18,
  },
  heroLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    marginBottom: 4,
  },
  heroAmount: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
  },
  // STYLES BARU UNTUK KARTU PENDAPATAN & PENARIKAN BULAN INI
  gridColumn: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    ...SHADOW.card,
  },
  cardFlexRow: {
    flexDirection: "row",
    gap: 12,
  },
  iconBox: {
    marginVertical: "auto",
    justifyContent: "center",
    alignItems: "center",
  },
  textFlexContainer: {
    flex: 1,
    justifyContent: "center",
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textMuted,
    marginBottom: 5,
  },
  cardValueIncome: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.success,
  },
  cardValuePayment: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.warning,
  },
  comparisonRow: {
    flexDirection: "row",
  },
  comparisonText: {
    fontSize: 8,
    marginVertical: "auto",
    fontWeight: "700",
  },
  comparisonLabel: {
    fontSize: 8,
    marginVertical: "auto",
    color: COLORS.textMuted,
  },
  // AKHIR STYLES BARU
  activitySectionSkeleton: {
    paddingHorizontal: 20,
    marginTop: 24,
    flex: 1,
  },
  activitySection: {
    flex: 1,
    marginTop: 24,
  },
  activityHeaderContainer: {
    zIndex: 99,
    paddingHorizontal: 20,
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
    position: "absolute",
    top: 34,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    width: 130,
    marginRight: 20,
    ...SHADOW.card,
    elevation: 5,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
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
    marginHorizontal: 20,
    ...SHADOW.card,
  },
  activityIcon: {
    width: 40,
    height: 40,
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
