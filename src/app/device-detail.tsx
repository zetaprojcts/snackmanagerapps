import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";

import { ChevronLeft, Edit, Filter, Mail, Wallet } from "lucide-react-native";

import React, { useMemo, useState } from "react";

import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Animated, {
  FadeInDown,
  FadeInUp,
  ZoomIn,
} from "react-native-reanimated";

import { BarChart } from "react-native-gifted-charts";

import { getDeviceDetail } from "../features/devices/api";

import { COLORS } from "../theme";

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
    const now = new Date();

    return items.filter((item) => {
      const trxDate = new Date(item.trx_date);

      if (periodFilter === "7days") {
        const diff = now.getTime() - trxDate.getTime();

        return diff <= 7 * 24 * 60 * 60 * 1000;
      }

      if (periodFilter === "month") {
        return (
          trxDate.getMonth() === now.getMonth() &&
          trxDate.getFullYear() === now.getFullYear()
        );
      }

      if (periodFilter === "90days") {
        const diff = now.getTime() - trxDate.getTime();

        return diff <= 90 * 24 * 60 * 60 * 1000;
      }

      return true;
    });
  };

  const chartSource =
    metricTab === "income" ? filterByPeriod(incomes) : filterByPeriod(payments);

  const chartData = chartSource.map((item: any) => ({
    value:
      metricTab === "income" ? Number(item.amount) : Number(item.gross_amount),

    label: new Date(item.trx_date).getDate().toString(),

    frontColor: metricTab === "income" ? COLORS.success : COLORS.danger,
  }));

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
      .slice(0, 10);
  }, [incomes, payments, activityFilter]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Data tidak ditemukan</Text>
      </View>
    );
  }
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeInDown.duration(300)} style={styles.header}>
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

      <Animated.View
        entering={FadeInUp.delay(100)}
        style={[styles.deviceCard, styles.cardShadow]}
      >
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

      <Animated.View
        entering={FadeInUp.delay(200)}
        style={[styles.balanceHero, styles.cardShadow]}
      >
        <Text style={styles.balanceLabel}>Saldo Saat Ini</Text>

        <Text style={styles.balanceValue}>
          Rp {balance.toLocaleString("id-ID")}
        </Text>
      </Animated.View>

      <Animated.View entering={ZoomIn.delay(300)} style={styles.summaryRow}>
        <View style={[styles.incomeCard, styles.cardShadow]}>
          <Text style={styles.summaryLabel}>Pendapatan</Text>

          <Text style={styles.summaryValue}>
            Rp {totalIncome.toLocaleString("id-ID")}
          </Text>
        </View>

        <View style={[styles.paymentCard, styles.cardShadow]}>
          <Text style={styles.summaryLabelDark}>Penarikan</Text>

          <Text style={styles.summaryValueDark}>
            Rp {totalPayment.toLocaleString("id-ID")}
          </Text>
        </View>
      </Animated.View>
      <Animated.View
        entering={FadeInUp.delay(400)}
        style={[styles.chartSection, styles.cardShadow]}
      >
        <View style={styles.chartHeader}>
          <View style={styles.chartTabs}>
            <TouchableOpacity
              style={[
                styles.chartTab,
                metricTab === "income" && styles.chartTabActive,
              ]}
              onPress={() => setMetricTab("income")}
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
              onPress={() => setMetricTab("payment")}
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

          <TouchableOpacity style={styles.filterButton}>
            <Filter size={18} color={"rgb(255, 255, 255)"} />
          </TouchableOpacity>
        </View>

        <View style={[styles.chartContainer, styles.cardShadow]}>
          {chartData.length > 0 ? (
            <BarChart
              data={chartData}
              height={200}
              barWidth={24}
              spacing={16}
              roundedTop
              hideRules
              noOfSections={4}
              yAxisThickness={0}
              xAxisThickness={1}
              isAnimated
              animationDuration={1200}
              xAxisLabelTextStyle={{
                color: COLORS.textMuted,
                fontSize: 11,
              }}
              yAxisTextStyle={{
                color: COLORS.textMuted,
                fontSize: 11,
              }}
            />
          ) : (
            <Text style={styles.emptyText}>
              Belum ada data untuk periode ini
            </Text>
          )}
        </View>
      </Animated.View>

      <Animated.View
        entering={FadeInUp.delay(500)}
        style={styles.activitySection}
      >
        <View style={styles.activityHeader}>
          <Text style={styles.sectionTitle}>Aktivitas Terakhir</Text>

          <View style={styles.activityTabs}>
            <TouchableOpacity
              style={[
                styles.activityChip,
                activityFilter === "income" && styles.activityChipActive,
              ]}
              onPress={() => setActivityFilter("income")}
            >
              <Text
                style={[
                  styles.activityChipText,
                  activityFilter === "income" && styles.activityChipTextActive,
                ]}
              >
                Income
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.activityChip,
                activityFilter === "payment" && styles.activityChipActive,
              ]}
              onPress={() => setActivityFilter("payment")}
            >
              <Text
                style={[
                  styles.activityChipText,
                  activityFilter === "payment" && styles.activityChipTextActive,
                ]}
              >
                Payment
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {activities.map((item, index) => (
          <Animated.View
            key={`${item.type}-${index}`}
            entering={FadeInUp.delay(100 * index)}
            style={[styles.activityItem, styles.cardShadow]}
          >
            <View>
              <Text style={styles.activityType}>
                {item.type === "income" ? "Pendapatan" : "Penarikan"}
              </Text>

              <Text style={styles.activityDate}>{item.trx_date}</Text>
            </View>

            <Text
              style={[
                styles.activityAmount,
                {
                  color:
                    item.type === "income" ? COLORS.success : COLORS.danger,
                },
              ]}
            >
              {item.type === "income" ? "+" : "-"}
              Rp {item.amount.toLocaleString("id-ID")}
            </Text>
          </Animated.View>
        ))}
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

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },

  deviceCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 20,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,

    elevation: 4,
  },

  deviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  deviceImage: {
    width: 70,
    height: 70,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  deviceName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },

  phoneNumber: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 16,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },

  infoText: {
    fontSize: 14,
    color: COLORS.text,
  },

  balanceHero: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    padding: 24,
  },

  balanceLabel: {
    color: "#FFFFFF",
    opacity: 0.8,
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
  },

  paymentCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
  },

  summaryLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
  },

  summaryLabelDark: {
    fontSize: 13,
    color: "#000000",
  },

  summaryValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 8,
  },

  summaryValueDark: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
    marginTop: 8,
  },

  chartSection: {
    marginTop: 24,
    marginHorizontal: 20,
  },

  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  chartTabs: {
    flexDirection: "row",
    gap: 10,
  },

  chartTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
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

  cardShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
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
  },

  emptyText: {
    textAlign: "center",
    color: COLORS.textMuted,
    marginVertical: 40,
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

  activityChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
  },

  activityChipActive: {
    backgroundColor: COLORS.primary,
  },

  activityChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text,
  },

  activityChipTextActive: {
    color: "#FFFFFF",
  },

  activityItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  activityType: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },

  activityDate: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },

  activityAmount: {
    fontSize: 15,
    fontWeight: "700",
  },

  statusChip: {
    alignSelf: "flex-start",
    marginTop: 6,
    paddingHorizontal: 10,
    height: 18,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },

  statusChipText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "500",
  },

  deviceTop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  deviceInfo: {
    flex: 1,
    marginLeft: 16,
  },
});
