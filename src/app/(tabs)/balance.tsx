import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  ArrowDownToLine,
  ArrowUpToLine,
  ChevronRight,
  Filter,
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
import { PieChart } from "react-native-gifted-charts";
import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";

import { BalanceScreenSkeleton } from "../../components/ui/Skeleton";
import { useAuth } from "../../features/auth/AuthProvider";
import { fetchBalanceSummary } from "../../features/balance/api";
import { fetchIncomeHistory } from "../../features/income/api";
import { fetchPaymentHistory } from "../../features/payment/api";
import { formatLocalDate } from "../../features/transactions/history";
import { COLORS, RADIUS, SHADOW } from "../../theme";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

type ActivityFilter = "all" | "income" | "payment";

type RecentActivity = {
  id: string;
  type: "income" | "payment";
  amount: number;
  trxDate: string;
  sortTime: number;
  deviceName: string;
};

export default function BalanceScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [activityFilter, setActivityFilter] =
    useState<ActivityFilter>("all");
  const [showActivityMenu, setShowActivityMenu] = useState(false);
  const today = formatLocalDate(new Date());

  const summaryQuery = useQuery({
    queryKey: ["tenant", user?.id, "balance", "summary", today],
    queryFn: () => fetchBalanceSummary(today),
    enabled: Boolean(user),
  });

  const incomeQuery = useQuery({
    queryKey: ["tenant", user?.id, "income", "recent"],
    queryFn: () => fetchIncomeHistory({ page: 0, pageSize: 10 }),
    enabled: Boolean(user),
  });

  const paymentQuery = useQuery({
    queryKey: ["tenant", user?.id, "payment", "recent"],
    queryFn: () => fetchPaymentHistory({ page: 0, pageSize: 10 }),
    enabled: Boolean(user),
  });

  const summary = summaryQuery.data ?? {
    totalIncome: 0,
    totalGrossPayment: 0,
    totalAdminFee: 0,
    incomeThisMonth: 0,
    expenseThisMonth: 0,
    adminFeeThisMonth: 0,
  };
  const netBalance = summary.totalIncome - summary.totalGrossPayment;
  const monthlyVolume =
    summary.incomeThisMonth +
    summary.expenseThisMonth +
    summary.adminFeeThisMonth;
  const pieData =
    monthlyVolume > 0
      ? [
          { value: summary.incomeThisMonth, color: COLORS.success },
          { value: summary.expenseThisMonth, color: COLORS.warning },
          { value: summary.adminFeeThisMonth, color: COLORS.danger },
        ].filter((item) => item.value > 0)
      : [{ value: 1, color: COLORS.border }];

  const recentActivities = useMemo(() => {
    const incomeActivities: RecentActivity[] =
      incomeQuery.data?.items.map((item) => {
        const device = Array.isArray(item.devices)
          ? item.devices[0]
          : item.devices;

        return {
          id: item.id,
          type: "income",
          amount: Number(item.amount),
          trxDate: item.trx_date,
          sortTime: new Date(item.created_at || item.trx_date).getTime(),
          deviceName: device?.device_name ?? "Perangkat",
        };
      }) ?? [];
    const paymentActivities: RecentActivity[] =
      paymentQuery.data?.items.map((item) => {
        const device = Array.isArray(item.devices)
          ? item.devices[0]
          : item.devices;

        return {
          id: item.id,
          type: "payment",
          amount: Number(item.gross_amount),
          trxDate: item.trx_date,
          sortTime: new Date(item.created_at || item.trx_date).getTime(),
          deviceName: device?.device_name ?? "Perangkat",
        };
      }) ?? [];

    const activities =
      activityFilter === "income"
        ? incomeActivities
        : activityFilter === "payment"
          ? paymentActivities
          : [...incomeActivities, ...paymentActivities];

    return activities.sort((a, b) => b.sortTime - a.sortTime).slice(0, 10);
  }, [activityFilter, incomeQuery.data, paymentQuery.data]);

  const animateLayout = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const selectActivityFilter = (filter: ActivityFilter) => {
    animateLayout();
    setActivityFilter(filter);
    setShowActivityMenu(false);
  };

  const refresh = async () => {
    await Promise.all([
      summaryQuery.refetch(),
      incomeQuery.refetch(),
      paymentQuery.refetch(),
    ]);
  };

  const isLoading =
    summaryQuery.isLoading || incomeQuery.isLoading || paymentQuery.isLoading;
  const isRefetching =
    summaryQuery.isRefetching ||
    incomeQuery.isRefetching ||
    paymentQuery.isRefetching;

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown} style={styles.header}>
        <Text style={styles.pageTitle}>Dashboard Saldo</Text>
      </Animated.View>

      {isLoading ? (
        <BalanceScreenSkeleton />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          onScrollBeginDrag={() => setShowActivityMenu(false)}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => void refresh()}
            />
          }
        >
          <Animated.View entering={FadeInUp.delay(80)} style={styles.heroCard}>
            <View style={styles.heroContent}>
              <View style={styles.heroText}>
                <Text style={styles.heroLabel}>Total Saldo</Text>
                <Text style={styles.heroAmount} numberOfLines={1}>
                  Rp {netBalance.toLocaleString("id-ID")}
                </Text>
              </View>
              <View style={styles.heroIconWrapper}>
                <Wallet size={38} color={COLORS.softBlue} />
              </View>
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(130)}
            style={styles.summarySection}
          >
            <Text style={styles.summaryTitle}>Ringkasan Bulan Ini</Text>
            <View style={styles.summaryContent}>
              <View style={styles.chartFrame}>
                <PieChart
                  data={pieData}
                  donut
                  radius={74}
                  innerRadius={47}
                  strokeWidth={2}
                  strokeColor="#FFFFFF"
                  centerLabelComponent={() => (
                    <View style={styles.chartCenter}>
                      <Text style={styles.chartCenterLabel}>Total</Text>
                      <Text
                        style={styles.chartCenterValue}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                      >
                        Rp {monthlyVolume.toLocaleString("id-ID")}
                      </Text>
                    </View>
                  )}
                />
              </View>
              <View style={styles.legend}>
                <LegendItem
                  color={COLORS.success}
                  label="Pendapatan"
                  value={summary.incomeThisMonth}
                />
                <LegendItem
                  color={COLORS.warning}
                  label="Pengeluaran"
                  value={summary.expenseThisMonth}
                />
                <LegendItem
                  color={COLORS.danger}
                  label="Biaya Admin"
                  value={summary.adminFeeThisMonth}
                />
              </View>
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(180)}
            style={styles.activitySection}
          >
            <View style={styles.activityHeader}>
              <Text style={styles.sectionTitle}>Aktivitas Terbaru</Text>
              <TouchableOpacity
                accessibilityLabel="Filter aktivitas"
                accessibilityRole="button"
                style={styles.activityFilterBtn}
                onPress={() => {
                  animateLayout();
                  setShowActivityMenu((current) => !current);
                }}
              >
                <Filter
                  size={19}
                  color={
                    activityFilter === "all"
                      ? COLORS.textMuted
                      : COLORS.primary
                  }
                />
              </TouchableOpacity>
            </View>

            {showActivityMenu && (
              <Animated.View entering={FadeIn.duration(160)} style={styles.menu}>
                <FilterOption
                  active={activityFilter === "all"}
                  label="Semua"
                  onPress={() => selectActivityFilter("all")}
                />
                <FilterOption
                  active={activityFilter === "income"}
                  label="Pendapatan"
                  onPress={() => selectActivityFilter("income")}
                />
                <FilterOption
                  active={activityFilter === "payment"}
                  label="Penarikan"
                  onPress={() => selectActivityFilter("payment")}
                />
              </Animated.View>
            )}

            {recentActivities.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>Belum Ada Aktivitas</Text>
                <Text style={styles.emptySubtitle}>
                  Tidak ada transaksi pada filter ini.
                </Text>
              </View>
            ) : (
              recentActivities.map((item) => {
                const isIncome = item.type === "income";
                return (
                  <TouchableOpacity
                    key={`${item.type}-${item.id}`}
                    accessibilityLabel={`Buka detail ${isIncome ? "pendapatan" : "penarikan"}`}
                    accessibilityRole="button"
                    activeOpacity={0.82}
                    style={styles.activityCard}
                    onPress={() =>
                      router.push({
                        pathname: isIncome
                          ? "/income-detail"
                          : "/payment-detail",
                        params: { id: item.id },
                      })
                    }
                  >
                    <View
                      style={[
                        styles.activityIcon,
                        {
                          backgroundColor: isIncome
                            ? COLORS.softGreen
                            : COLORS.softYellow,
                        },
                      ]}
                    >
                      {isIncome ? (
                        <ArrowDownToLine size={18} color={COLORS.success} />
                      ) : (
                        <ArrowUpToLine size={18} color={COLORS.warning} />
                      )}
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={styles.activityDevice} numberOfLines={1}>
                        {item.deviceName}
                      </Text>
                      <Text style={styles.activityDate}>
                        {new Date(item.trxDate).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.activityAmount,
                        { color: isIncome ? COLORS.success : COLORS.warning },
                      ]}
                      numberOfLines={1}
                    >
                      {isIncome ? "+" : "-"} Rp{" "}
                      {item.amount.toLocaleString("id-ID")}
                    </Text>
                    <ChevronRight size={17} color={COLORS.textMuted} />
                  </TouchableOpacity>
                );
              })
            )}
          </Animated.View>
        </ScrollView>
      )}
    </View>
  );
}

function LegendItem({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: number;
}) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendSwatch, { backgroundColor: color }]} />
      <View style={styles.legendText}>
        <Text style={styles.legendLabel}>{label}</Text>
        <Text style={styles.legendValue} numberOfLines={1}>
          Rp {value.toLocaleString("id-ID")}
        </Text>
      </View>
    </View>
  );
}

function FilterOption({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Text style={[styles.menuText, active && styles.menuTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  pageTitle: { fontSize: 22, fontWeight: "800", color: COLORS.text },
  scrollContent: { paddingBottom: 120 },
  heroCard: {
    marginHorizontal: 20,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.card,
    padding: 24,
    ...SHADOW.card,
  },
  heroContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroText: { flex: 1, marginRight: 14 },
  heroIconWrapper: {
    width: 62,
    height: 62,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(89,133,245,0.81)",
    borderRadius: RADIUS.control,
  },
  heroLabel: { color: "rgba(255,255,255,0.8)", fontSize: 13 },
  heroAmount: {
    marginTop: 5,
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
  },
  summarySection: {
    marginTop: 18,
    marginHorizontal: 20,
    paddingHorizontal: 18,
    paddingVertical: 20,
    borderRadius: RADIUS.card,
    backgroundColor: "#FFFFFF",
    ...SHADOW.card,
  },
  summaryTitle: {
    marginBottom: 16,
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "700",
  },
  summaryContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 22,
  },
  chartFrame: {
    width: 150,
    height: 150,
    alignItems: "center",
    justifyContent: "center",
  },
  chartCenter: {
    width: 82,
    alignItems: "center",
  },
  chartCenterLabel: { color: COLORS.textMuted, fontSize: 10 },
  chartCenterValue: {
    width: 78,
    marginTop: 3,
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },
  legend: { flex: 1, gap: 14 },
  legendItem: { flexDirection: "row", alignItems: "center" },
  legendSwatch: { width: 11, height: 11, borderRadius: RADIUS.sm },
  legendText: { flex: 1, marginLeft: 9 },
  legendLabel: { color: COLORS.textMuted, fontSize: 11 },
  legendValue: {
    marginTop: 2,
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
  },
  activitySection: { marginTop: 24, paddingHorizontal: 20 },
  activityHeader: {
    position: "relative",
    zIndex: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: { color: COLORS.text, fontSize: 18, fontWeight: "700" },
  activityFilterBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  menu: {
    position: "absolute",
    top: 44,
    right: 20,
    width: 142,
    borderRadius: RADIUS.card,
    backgroundColor: "#FFFFFF",
    ...SHADOW.card,
    zIndex: 12,
    elevation: 12,
  },
  menuItem: { minHeight: 44, justifyContent: "center", paddingHorizontal: 16 },
  menuText: { color: COLORS.textMuted, fontSize: 13 },
  menuTextActive: { color: COLORS.primary, fontWeight: "700" },
  activityCard: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    padding: 14,
    borderRadius: RADIUS.card,
    backgroundColor: "#FFFFFF",
    ...SHADOW.card,
  },
  activityIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: RADIUS.control,
  },
  activityContent: { flex: 1, marginLeft: 12 },
  activityDevice: { color: COLORS.text, fontSize: 14, fontWeight: "700" },
  activityDate: { marginTop: 3, color: COLORS.textMuted, fontSize: 12 },
  activityAmount: {
    maxWidth: "38%",
    marginHorizontal: 8,
    fontSize: 13,
    fontWeight: "700",
  },
  emptyState: { paddingVertical: 40, alignItems: "center" },
  emptyTitle: { color: COLORS.text, fontSize: 16, fontWeight: "700" },
  emptySubtitle: { marginTop: 6, color: COLORS.textMuted, fontSize: 13 },
});
