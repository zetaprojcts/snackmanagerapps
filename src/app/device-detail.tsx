import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Edit, Filter, Mail, Wallet } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { BarChart } from "react-native-gifted-charts";

import EmptyState from "../components/ui/EmptyState";
import {
  BalanceCardSkeleton,
  DeviceCardSkeleton,
  TransactionCardSkeleton,
} from "../components/ui/Skeleton";
import { getDeviceDetail } from "../features/devices/api";
import { COLORS, SHADOW } from "../theme";

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

  // State untuk mendeteksi bar mana yang sedang ditekan/aktif
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

  const filterByPeriod = (items: any[]) => {
    if (!items?.length) {
      return [];
    }

    const now = new Date();

    return items.filter((item) => {
      if (!item?.trx_date) {
        return false;
      }

      const trxDate = new Date(item.trx_date);
      const diffDays = Math.floor(
        (now.getTime() - trxDate.getTime()) / (1000 * 60 * 60 * 24)
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
    (a, b) => new Date(a.trx_date).getTime() - new Date(b.trx_date).getTime()
  );

  // Menyusun data chart dengan nominal penuh sesuai input user
  const chartData = sortedChartSource.map((item: any, index: number) => {
    const rawValue = Number(metricTab === "income" ? item.amount : item.gross_amount);
    const isSelected = selectedIndex === index;

    return {
      value: rawValue,
      label: new Date(item.trx_date).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
      }),
      frontColor: COLORS.primary,
      
      // Menampilkan teks nominal asli lengkap dengan format ribuan Indonesia
      topLabelComponent: () => {
        if (!isSelected) return null;
        return (
          <View style={styles.tooltipContainer}>
            <Text style={styles.tooltipText}>
              {rawValue.toLocaleString("id-ID")}
            </Text>
          </View>
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
          new Date(b.trx_date).getTime() - new Date(a.trx_date).getTime()
      )
      .slice(0, 4);
  }, [incomes, payments, activityFilter]);

  if (isLoading) {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Detail Perangkat</Text>
        </View>
        <DeviceCardSkeleton />
        <View style={{ height: 16 }} />
        <BalanceCardSkeleton />
        <View style={{ height: 16 }} />
        <BalanceCardSkeleton />
        <View style={{ marginHorizontal: 20, marginTop: 20 }}>
          <TransactionCardSkeleton />
          <TransactionCardSkeleton />
          <TransactionCardSkeleton />
        </View>
      </ScrollView>
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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeInDown} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Detail Perangkat</Text>
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/edit-device",
              params: {
                id: device.id,
              },
            })
          }
        >
          <Edit size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={FadeInUp} style={styles.deviceCard}>
        <View style={styles.deviceTop}>
          <Image
            source={imageSource}
            style={styles.deviceImage}
            resizeMode="contain"
          />
          <View style={styles.deviceInfo}>
            <Text style={styles.deviceName}>{device.device_name}</Text>
            <Text style={styles.phoneNumber}>{device.phone_number || "-"}</Text>
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

      <Animated.View entering={FadeInUp.delay(100)} style={styles.balanceHero}>
        <Text style={styles.balanceLabel}>Saldo Saat Ini</Text>
        <Text style={styles.balanceValue}>
          Rp {balance.toLocaleString("id-ID")}
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(150)} style={styles.summaryRow}>
        <View style={styles.incomeCard}>
          <Text style={styles.summaryLabel}>Pendapatan</Text>
          <Text style={styles.summaryValue}>
            Rp {totalIncome.toLocaleString("id-ID")}
          </Text>
        </View>
        <View style={styles.paymentCard}>
          <Text style={styles.summaryLabelDark}>Penarikan</Text>
          <Text style={styles.summaryValueDark}>
            Rp {totalPayment.toLocaleString("id-ID")}
          </Text>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(200)} style={styles.chartSection}>
        <View style={styles.chartHeader}>
          <View>
            <View style={styles.chartTabs}>
              <TouchableOpacity
                style={[
                  styles.chartTab,
                  metricTab === "income" && styles.chartTabActive,
                ]}
                onPress={() => {
                  setMetricTab("income");
                  setSelectedIndex(null);
                }}
              >
                <Text
                  style={[
                    styles.chartTabText,
                    metricTab === "income" && styles.chartTabTextActive,
                  ]}
                >
                  Pendapatan
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.chartTab,
                  metricTab === "payment" && styles.chartTabActive,
                ]}
                onPress={() => {
                  setMetricTab("payment");
                  setSelectedIndex(null);
                }}
              >
                <Text
                  style={[
                    styles.chartTabText,
                    metricTab === "payment" && styles.chartTabTextActive,
                  ]}
                >
                  Penarikan
                </Text>
              </TouchableOpacity>
            </View>
            <Text
              style={{
                marginTop: 10,
                color: COLORS.textMuted,
                fontSize: 12,
              }}
            >
              Filter :
              {periodFilter === "7days"
                ? " 7 Hari"
                : periodFilter === "month"
                  ? " Bulan Ini"
                  : " 90 Hari"}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => {
              setSelectedIndex(null);
              if (periodFilter === "7days") {
                setPeriodFilter("month");
                return;
              }
              if (periodFilter === "month") {
                setPeriodFilter("90days");
                return;
              }
              setPeriodFilter("7days");
            }}
          >
            <Filter size={18} color="#FFFFFF" />
          </TouchableOpacity>
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
              animationDuration={1000}
              xAxisLabelTextStyle={{
                color: COLORS.textMuted,
                fontSize: 9,
              }}
              yAxisTextStyle={{
                color: COLORS.textMuted,
                fontSize: 10,
              }}
              onPress={(item: any, index: number) => {
                setSelectedIndex(selectedIndex === index ? null : index);
              }}
              focusedBarConfig={{
                glowColor: 'rgba(33, 150, 243, 0.2)',
                glowRadius: 4,
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
        <View style={styles.activityHeader}>
          <Text style={styles.sectionTitle}>Aktivitas Terbaru</Text>
        </View>

        {activities.length === 0 ? (
          <EmptyState
            title="Belum Ada Aktivitas"
            subtitle="Aktivitas perangkat akan muncul di sini"
          />
        ) : (
          activities.map((item, index) => (
            <Animated.View
              key={`${item.type}-${index}`}
              entering={FadeInUp.delay(index * 50)}
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
                      item.type === "income" ? COLORS.success : COLORS.warning,
                  },
                ]}
              >
                {item.type === "income" ? "+" : "-"}
                Rp {item.amount.toLocaleString("id-ID")}
              </Text>
            </Animated.View>
          ))
        )}
      </Animated.View>
    </ScrollView>
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
    marginBottom: 20,
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
  incomeCard: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 18,
    ...SHADOW.card,
  },
  paymentCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    ...SHADOW.card,
  },
  summaryLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 8,
  },
  summaryLabelDark: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  summaryValueDark: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 8,
  },
  chartSection: {
    marginTop: 24,
    marginHorizontal: 20,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  chartTabs: {
    flexDirection: "row",
    gap: 10,
  },
  chartTab: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  chartTabActive: {
    backgroundColor: COLORS.primary,
  },
  chartTabText: {
    color: COLORS.text,
    fontWeight: "600",
  },
  chartTabTextActive: {
    color: "#FFFFFF",
  },
  filterButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  chartContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    paddingTop: 32,
    ...SHADOW.card,
  },
  tooltipContainer: {
    position: 'absolute',
    bottom: 4,         
    width: 70,         
    left: -26,         
    backgroundColor: '#1A1A1A',
    paddingVertical: 5,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,       
  },
  tooltipText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  activitySection: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 120,
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
  activityTabs: {
    flexDirection: "row",
    gap: 8,
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
