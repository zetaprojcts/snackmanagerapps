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
  Pressable,
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
  
  const [showAdminFee, setShowAdminFee] = useState(false);

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
    let adminFeeThisMonth = 0;
    let adminFeeLastMonth = 0;

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
      const netAmt =
        Number(item.gross_amount || 0) - Number(item.admin_fee || 0);
      const feeAmt = Number(item.admin_fee || 0);

      if (item.trx_date) {
        const d = new Date(item.trx_date);
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
          paymentThisMonth += netAmt;
          adminFeeThisMonth += feeAmt;
        }
        if (d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear) {
          paymentLastMonth += netAmt;
          adminFeeLastMonth += feeAmt;
        }
      }
    });

    const calculatePercentage = (thisMonth: number, lastMonth: number) => {
      if (lastMonth === 0) return thisMonth > 0 ? 100 : 0;
      return ((thisMonth - lastMonth) / lastMonth) * 100;
    };

    return {
      incomeThisMonth,
      paymentThisMonth,
      adminFeeThisMonth,
      incomePercentage: calculatePercentage(incomeThisMonth, incomeLastMonth),
      paymentPercentage: calculatePercentage(
        paymentThisMonth,
        paymentLastMonth,
      ),
      adminFeePercentage: calculatePercentage(
        adminFeeThisMonth,
        adminFeeLastMonth,
      ),
    };
  }, [incomes, payments]);

  const recentActivities = useMemo(() => {
    const incomeActivities =
      incomes?.map((item: any) => ({
        type: "income",
        amount: Number(item.amount),
        trx_date: item.trx_date,
        sort_time: new Date(item.created_at || item.trx_date).getTime(),
        device_name: item.devices?.device_name ?? "Perangkat",
      })) || [];

    const paymentActivities =
      payments?.map((item: any) => ({
        type: "payment",
        amount: Number(item.gross_amount),
        trx_date: item.trx_date,
        sort_time: new Date(item.created_at || item.trx_date).getTime(),
        device_name: item.devices?.device_name ?? "Perangkat",
      })) || [];

    let merged = [...incomeActivities, ...paymentActivities];

    if (activityFilter === "income") {
      merged = incomeActivities;
    }

    if (activityFilter === "payment") {
      merged = paymentActivities;
    }

    return (
      merged
        .sort((a, b) => b.sort_time - a.sort_time)
        .slice(0, 10)
    );
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
      {/* Overlay telah dipindahkan ke bagian activityHeaderContainer */}
      
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

      <Animated.View entering={FadeInUp.delay(150)} style={styles.cardRow}>
        <View style={styles.statCard}>
          <View style={styles.statCardTopRow}>
            <View
              style={[styles.iconBox, { backgroundColor: COLORS.softGreen }]}
            >
              <ArrowDownToLine size={18} color={COLORS.success} />
            </View>
            <View style={styles.statCardTextWrapper}>
              <Text style={styles.cardLabel}>Pendapatan</Text>
              <Text
                style={styles.cardValueIncome}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                + Rp {monthlyStats.incomeThisMonth.toLocaleString("id-ID")}
              </Text>
            </View>
          </View>

          <View style={styles.statCardBottomRow}>
            {monthlyStats.incomePercentage >= 0 ? (
              <TrendingUp size={12} color={COLORS.success} />
            ) : (
              <TrendingDown size={12} color={COLORS.danger} />
            )}
            <Text
              style={[
                styles.percentageText,
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
            <Text style={styles.percentageLabel}> vs Bulan Berlalu</Text>
          </View>
        </View>

        <TouchableOpacity 
          activeOpacity={0.8} 
          style={styles.statCard} 
          onPress={() => {
            animateLayout();
            setShowAdminFee(!showAdminFee);
          }}
        >
          {!showAdminFee ? (
            <View>
              <View style={styles.statCardTopRow}>
                <View
                  style={[styles.iconBox, { backgroundColor: COLORS.softYellow }]}
                >
                  <ArrowUpToLine size={18} color={COLORS.warning} />
                </View>
                <View style={styles.statCardTextWrapper}>
                  <Text style={styles.cardLabel}>Penarikan</Text>
                  <Text
                    style={styles.cardValuePayment}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    - Rp {monthlyStats.paymentThisMonth.toLocaleString("id-ID")}
                  </Text>
                </View>
              </View>

              <View style={styles.statCardBottomRow}>
                {monthlyStats.paymentPercentage <= 0 ? (
                  <TrendingDown size={12} color={COLORS.success} />
                ) : (
                  <TrendingUp size={12} color={COLORS.danger} />
                )}
                <Text
                  style={[
                    styles.percentageText,
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
                <Text style={styles.percentageLabel}> vs Bulan Berlalu</Text>
              </View>
            </View>
          ) : (
            <View>
              <View style={styles.statCardTopRow}>
                <View
                  style={[styles.iconBox, { backgroundColor: "#FCE8E8" }]}
                >
                  <ArrowUpToLine size={18} color={COLORS.danger} />
                </View>
                <View style={styles.statCardTextWrapper}>
                  <Text style={styles.cardLabel}>Biaya Admin</Text>
                  <Text
                    style={[styles.cardValuePayment, { color: COLORS.danger }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    - Rp {monthlyStats.adminFeeThisMonth.toLocaleString("id-ID")}
                  </Text>
                </View>
              </View>

              <View style={styles.statCardBottomRow}>
                {monthlyStats.adminFeePercentage <= 0 ? (
                  <TrendingDown size={12} color={COLORS.success} />
                ) : (
                  <TrendingUp size={12} color={COLORS.danger} />
                )}
                <Text
                  style={[
                    styles.percentageText,
                    {
                      color:
                        monthlyStats.adminFeePercentage <= 0
                          ? COLORS.success
                          : COLORS.danger,
                    },
                  ]}
                >
                  {monthlyStats.adminFeePercentage > 0 ? "+" : ""}
                  {monthlyStats.adminFeePercentage.toFixed(1)}%
                </Text>
                <Text style={styles.percentageLabel}> vs Bulan Berlalu</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>

      <Animated.View
        entering={FadeInUp.delay(200)}
        style={styles.activitySection}
      >
        <View style={styles.activityHeaderContainer}>
          {/* FIX: Memindahkan overlay ke dalam wadah yang sama dengan Dropdown */}
          {showActivityMenu && (
            <Pressable
              style={{
                position: "absolute",
                top: -2000,
                bottom: -2000,
                left: -2000,
                right: -2000,
                zIndex: 1,
                elevation: 1,
                backgroundColor: "transparent",
              }}
              onPress={() => {
                animateLayout();
                setShowActivityMenu(false);
              }}
            />
          )}

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
    padding: 14,
    ...SHADOW.card,
  },
  statCardTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  statCardTextWrapper: {
    flex: 1,
    marginLeft: 10,
    justifyContent: "center",
  },
  cardLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  cardValueIncome: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.success,
  },
  cardValuePayment: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.warning,
  },
  statCardBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  percentageText: {
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 4,
  },
  percentageLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
  },

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
    elevation: 10, // FIX: Memberikan elevation agar tumpukan (stack) aman di Android
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
    elevation: 11, // FIX: Memastikan dropdown selalu di atas overlay transparan
    zIndex: 11,    // FIX: Memastikan dropdown selalu di atas overlay transparan
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
