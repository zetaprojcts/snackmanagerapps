import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Edit, Filter, Mail, Wallet } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  Image,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { BarChart } from "react-native-gifted-charts";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";

import EmptyState from "../components/ui/EmptyState";
import {
  BalanceCardSkeleton,
  DeviceCardSkeleton,
  TransactionCardSkeleton,
} from "../components/ui/Skeleton";
import { getDeviceDetail } from "../features/devices/api";
import { COLORS, SHADOW } from "../theme";

if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const BRAND_IMAGES: Record<string, any> = {
  Samsung: require("../../assets/devices/samsung.png"),
  Oppo: require("../../assets/devices/oppo.png"),
  Vivo: require("../../assets/devices/vivo.png"),
  Xiaomi: require("../../assets/devices/xiaomi.png"),
  Realme: require("../../assets/devices/realme.png"),
  Infinix: require("../../assets/devices/infinix.png"),
};

const DEFAULT_IMAGE = require("../../assets/devices/default.png");

export default function DeviceDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [metricTab, setMetricTab] = useState<"income" | "payment">("income");
  const [periodFilter, setPeriodFilter] = useState<
    "7days" | "month" | "90days"
  >("7days");

  const [activityFilter, setActivityFilter] = useState<
    "all" | "income" | "payment"
  >("all");
  const [showActivityMenu, setShowActivityMenu] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["device-detail", id],
    queryFn: () => getDeviceDetail(id as string),
  });

  const device = data?.device;
  const incomes = data?.incomes ?? [];
  const payments = data?.payments ?? [];
  const totalIncome = data?.totalIncome ?? 0;
  const totalPayment = data?.totalPayment ?? 0;
  const balance = data?.balance ?? 0;
  const imageSource = BRAND_IMAGES[device?.brand || ""] || DEFAULT_IMAGE;

  const animateLayout = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const filterByPeriod = (items: any[]) => {
    if (!items?.length) return [];
    const now = new Date();

    return items.filter((item) => {
      if (!item?.trx_date) return false;
      const trxDate = new Date(item.trx_date);
      const diffDays = Math.floor(
        (now.getTime() - trxDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      switch (periodFilter) {
        case "7days":
          return diffDays <= 7;
        case "month":
          return (
            trxDate.getMonth() === now.getMonth() &&
            trxDate.getFullYear() === now.getFullYear()
          );
        case "90days":
          return diffDays <= 90;
        default:
          return true;
      }
    });
  };

  const chartSource =
    metricTab === "income" ? filterByPeriod(incomes) : filterByPeriod(payments);

  const sortedChartSource = [...chartSource].sort(
    (a, b) => new Date(a.trx_date).getTime() - new Date(b.trx_date).getTime(),
  );

  const chartData = sortedChartSource.map((item: any, index: number) => {
    const rawValue = Number(
      metricTab === "income" ? item.amount : item.gross_amount,
    );
    const isSelected = selectedIndex === index;

    return {
      value: rawValue,
      label: new Date(item.trx_date).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
      }),
      frontColor: COLORS.primary,
      topLabelComponent: () => {
        if (!isSelected) return null;
        return (
          <Animated.View
            entering={FadeIn.duration(200)}
            style={styles.tooltipContainer}
          >
            <Text style={styles.tooltipText}>
              {rawValue.toLocaleString("id-ID")}
            </Text>
          </Animated.View>
        );
      },
      opacity: selectedIndex === null || isSelected ? 1 : 0.6,
    };
  });

  const activities = useMemo(() => {
    const incomeList = incomes.map((item: any) => ({
      type: "income",
      amount: Number(item.amount),
      trx_date: item.trx_date,
    }));

    const paymentList = payments.map((item: any) => ({
      type: "payment",
      amount: Number(item.gross_amount),
      trx_date: item.trx_date,
    }));

    let merged = [...incomeList, ...paymentList];

    if (activityFilter === "income") {
      merged = incomeList;
    }

    if (activityFilter === "payment") {
      merged = paymentList;
    }

    return merged
      .sort(
        (a, b) =>
          new Date(b.trx_date).getTime() - new Date(a.trx_date).getTime(),
      )
      .slice(0, 7);
  }, [incomes, payments, activityFilter]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Detail Perangkat</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <DeviceCardSkeleton />

          <View style={{ marginTop: 16 }}>
            <BalanceCardSkeleton />
          </View>

          <View style={styles.summaryRow}>
            <View
              style={[
                styles.summaryCard,
                {
                  backgroundColor: "#E5E7EB",
                  height: 85,
                  borderWidth: 0,
                  elevation: 0,
                },
              ]}
            />
            <View
              style={[
                styles.summaryCard,
                {
                  backgroundColor: "#E5E7EB",
                  height: 85,
                  borderWidth: 0,
                  elevation: 0,
                },
              ]}
            />
          </View>

          <View style={styles.chartSection}>
            <View style={styles.chartFilterContainer}>
              <View
                style={{
                  width: 70,
                  height: 32,
                  backgroundColor: "#E5E7EB",
                  borderRadius: 999,
                }}
              />
              <View
                style={{
                  width: 85,
                  height: 32,
                  backgroundColor: "#E5E7EB",
                  borderRadius: 999,
                }}
              />
              <View
                style={{
                  width: 70,
                  height: 32,
                  backgroundColor: "#E5E7EB",
                  borderRadius: 999,
                }}
              />
            </View>
            <View
              style={[
                styles.chartContainer,
                {
                  height: 220,
                  backgroundColor: "#E5E7EB",
                  borderWidth: 0,
                  elevation: 0,
                },
              ]}
            />
          </View>

          <View style={styles.activitySection}>
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
        </ScrollView>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.centerContainer}>
        <EmptyState
          title="Device Tidak Ditemukan"
          subtitle="Data perangkat tidak tersedia"
        />
      </View>
    );
  }

  const isIncomeActive = metricTab === "income";
  const isPaymentActive = metricTab === "payment";

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Detail Perangkat</Text>
        <TouchableOpacity
          onPress={() =>
            router.push({ pathname: "/edit-device", params: { id: device.id } })
          }
        >
          <Edit size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Animated.View entering={FadeInUp} style={styles.deviceCard}>
          <View style={styles.deviceTop}>
            <Image
              source={imageSource}
              style={styles.deviceImage}
              resizeMode="contain"
            />
            <View style={styles.deviceInfo}>
              <Text style={styles.deviceName}>{device.device_name}</Text>
              <Text style={styles.phoneNumber}>
                {device.phone_number || "-"}
              </Text>
              <View
                style={[
                  styles.statusChip,
                  {
                    backgroundColor: device.is_active
                      ? COLORS.success
                      : COLORS.danger,
                  },
                ]}
              >
                <Text style={styles.statusChipText}>
                  {device.is_active ? "Aktif" : "Nonaktif"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Mail size={16} color={COLORS.textMuted} />
            <Text style={styles.infoText}>{device.email || "-"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Wallet size={16} color={COLORS.textMuted} />
            <Text style={styles.infoText}>{device.ewallet || "-"}</Text>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(100)}
          style={styles.balanceHero}
        >
          <Text style={styles.balanceLabel}>Saldo Saat Ini</Text>
          <Text style={styles.balanceValue}>
            Rp {balance.toLocaleString("id-ID")}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(150)} style={styles.summaryRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.summaryCard,
              isIncomeActive ? styles.cardActive : styles.cardInactive,
            ]}
            onPress={() => {
              animateLayout();
              setMetricTab("income");
              setSelectedIndex(null);
            }}
          >
            <Text
              style={[
                styles.summaryLabel,
                isIncomeActive ? styles.textWhite : styles.textDarkMuted,
              ]}
            >
              Pendapatan
            </Text>
            <Text
              style={[
                styles.summaryValue,
                isIncomeActive ? styles.textWhite : styles.textDark,
              ]}
            >
              Rp {totalIncome.toLocaleString("id-ID")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.summaryCard,
              isPaymentActive ? styles.cardActive : styles.cardInactive,
            ]}
            onPress={() => {
              animateLayout();
              setMetricTab("payment");
              setSelectedIndex(null);
            }}
          >
            <Text
              style={[
                styles.summaryLabel,
                isPaymentActive ? styles.textWhite : styles.textDarkMuted,
              ]}
            >
              Penarikan
            </Text>
            <Text
              style={[
                styles.summaryValue,
                isPaymentActive ? styles.textWhite : styles.textDark,
              ]}
            >
              Rp {totalPayment.toLocaleString("id-ID")}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(200)}
          style={styles.chartSection}
        >
          <View style={styles.chartFilterContainer}>
            {[
              { id: "7days", label: "7 Hari" },
              { id: "month", label: "Bulan Ini" },
              { id: "90days", label: "90 Hari" },
            ].map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.filterChip,
                  periodFilter === item.id && styles.filterChipActive,
                ]}
                onPress={() => {
                  animateLayout();
                  setPeriodFilter(item.id as any);
                  setSelectedIndex(null);
                }}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    periodFilter === item.id && styles.filterChipTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.chartContainer}>
            {chartData.length > 0 ? (
              <BarChart
                data={chartData}
                height={160}
                barWidth={18}
                spacing={14}
                noOfSections={5}
                yAxisThickness={0}
                xAxisThickness={1}
                isAnimated
                animationDuration={800}
                xAxisLabelTextStyle={{ color: COLORS.textMuted, fontSize: 9 }}
                yAxisTextStyle={{ color: COLORS.textMuted, fontSize: 10 }}
                onPress={(item: any, index: number) => {
                  animateLayout();
                  setSelectedIndex(selectedIndex === index ? null : index);
                }}
              />
            ) : (
              <EmptyState
                title="Belum Ada Data"
                subtitle="Belum ada transaksi pada periode ini"
              />
            )}
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(250)}
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

          {activities.length === 0 ? (
            <Animated.View entering={FadeIn.duration(300)}>
              <EmptyState
                title="Belum Ada Aktivitas"
                subtitle={`Tidak ada data ${activityFilter === "income" ? "pemasukan" : activityFilter === "payment" ? "penarikan" : "transaksi"}`}
              />
            </Animated.View>
          ) : (
            activities.map((item, index) => (
              <Animated.View
                key={`${item.type}-${item.trx_date}-${index}`}
                entering={FadeInUp.duration(300).delay(index * 40)}
                style={styles.activityItem}
              >
                <View>
                  <Text style={styles.activityType}>
                    {item.type === "income" ? "Pendapatan" : "Penarikan"}
                  </Text>
                  <Text style={styles.activityDate}>
                    {new Date(item.trx_date).toLocaleDateString("id-ID")}
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
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 55,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: COLORS.background,
    zIndex: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text,
  },
  deviceCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 20,
    ...SHADOW.card,
  },
  deviceTop: {
    flexDirection: "row",
  },
  deviceImage: {
    width: 72,
    height: 72,
  },
  deviceInfo: {
    flex: 1,
    marginLeft: 16,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  phoneNumber: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  statusChip: {
    alignSelf: "flex-start",
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusChipText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },
  infoText: {
    flex: 1,
    flexWrap: "wrap",
    fontSize: 14,
    color: COLORS.text,
  },
  balanceHero: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    padding: 24,
    ...SHADOW.card,
  },
  balanceLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
  },
  balanceValue: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
    marginTop: 6,
  },
  summaryRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 20,
    padding: 18,
    ...SHADOW.card,
  },
  cardActive: {
    backgroundColor: COLORS.primary,
  },
  cardInactive: {
    backgroundColor: "#FFFFFF",
  },
  summaryLabel: {
    fontSize: 13,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 8,
  },
  textWhite: {
    color: "#FFFFFF",
  },
  textDark: {
    color: COLORS.text,
  },
  textDarkMuted: {
    color: COLORS.textMuted,
  },
  chartSection: {
    marginTop: 24,
    marginHorizontal: 20,
  },
  chartFilterContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  chartContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    paddingTop: 32,
    ...SHADOW.card,
  },
  tooltipContainer: {
    position: "absolute",
    bottom: 4,
    width: 70,
    left: -26,
    backgroundColor: "#1A1A1A",
    paddingVertical: 5,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  tooltipText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
  },
  activitySection: {
    marginHorizontal: 20,
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
    position: "absolute",
    top: 36,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    width: 130,
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
  activityItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...SHADOW.card,
  },
  activityType: {
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
});
