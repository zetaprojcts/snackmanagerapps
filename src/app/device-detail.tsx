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
                  metric
