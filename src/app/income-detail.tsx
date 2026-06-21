import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
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
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import EmptyState from "../components/ui/EmptyState";
import { BalanceCardSkeleton, DeviceCardSkeleton, TransactionCardSkeleton } from "../components/ui/Skeleton";
import { fetchIncomes, getIncomeById } from "../features/income/api";
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

export default function IncomeDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [periodFilter, setPeriodFilter] = useState<"7days" | "month" | "90days">("7days");

  const { data: incomeDetail, isLoading: loadingDetail } = useQuery({
    queryKey: ["income-detail", id],
    queryFn: () => getIncomeById(id as string),
  });

  const { data: allIncomes, isLoading: loadingAll } = useQuery({
    queryKey: ["income"],
    queryFn: fetchIncomes,
  });

  const device = incomeDetail?.devices;
  const imageSource = BRAND_IMAGES[device?.brand || ""] || DEFAULT_IMAGE;

  const animateLayout = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  // 1. Ambil semua income khusus perangkat ini
  const deviceIncomes = useMemo(() => {
    if (!allIncomes || !device) return [];
    return allIncomes.filter(
      (item: any) => item.device_id === device.id || item.devices?.id === device.id
    ).sort((a: any, b: any) => new Date(b.trx_date).getTime() - new Date(a.trx_date).getTime());
  }, [allIncomes, device]);

  // 2. Hitung Total Keseluruhan
  const totalDeviceIncome = useMemo(() => {
    return deviceIncomes.reduce((total: number, item: any) => total + Number(item.amount || 0), 0);
  }, [deviceIncomes]);

  // 3. Filter data berdasarkan tab periode yang dipilih
  const filteredForChart = useMemo(() => {
    const now = new Date();
    return deviceIncomes.filter((item: any) => {
      const trxDate = new Date(item.trx_date);
      const diffDays = Math.floor((now.getTime() - trxDate.getTime()) / (1000 * 60 * 60 * 24));
      if (periodFilter === "7days") return diffDays <= 7;
      if (periodFilter === "month") return trxDate.getMonth() === now.getMonth() && trxDate.getFullYear() === now.getFullYear();
      if (periodFilter === "90days") return diffDays <= 90;
      return true;
    });
  }, [deviceIncomes, periodFilter]);

  // 4. Kelompokkan data berdasarkan tanggal agar rapi di chart (misal: 19/06)
  const chartData = useMemo(() => {
    const grouped = filteredForChart.reduce((acc: any, curr: any) => {
      const date = new Date(curr.trx_date);
      const dayStr = date.getDate().toString().padStart(2, '0');
      const monthStr = (date.getMonth() + 1).toString().padStart(2, '0');
      const dateLabel = `${dayStr}/${monthStr}`;
      
      if (!acc[dateLabel]) acc[dateLabel] = 0;
      acc[dateLabel] += Number(curr.amount);
      return acc;
    }, {});

    // Urutkan dari tanggal paling lama ke paling baru (kiri ke kanan di chart)
    const sortedDates = Object.keys(grouped).sort((a, b) => {
      const [dayA, monthA] = a.split('/');
      const [dayB, monthB] = b.split('/');
      return new Date(2020, Number(monthA) - 1, Number(dayA)).getTime() - new Date(2020, Number(monthB) - 1, Number(dayB)).getTime();
    });

    return sortedDates.map((date) => ({
      value: grouped[date],
      label: date,
      frontColor: COLORS.primary,
    }));
  }, [filteredForChart]);

  const isLoading = loadingDetail || loadingAll;

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}><ChevronLeft size={24} color={COLORS.text} /></TouchableOpacity>
          <Text style={styles.title}>Detail Pendapatan</Text>
          <View style={{ width: 24 }} />
        </View>
        <ScrollView style={{ paddingHorizontal: 20 }}>
          <DeviceCardSkeleton />
          <View style={{ height: 16 }} />
          <BalanceCardSkeleton />
          <View style={{ height: 16 }} />
          <TransactionCardSkeleton />
        </ScrollView>
      </View>
    );
  }

  if (!incomeDetail) return <View style={styles.centerContainer}><EmptyState title="Data Tidak Ditemukan" subtitle="Income tidak tersedia" /></View>;

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Detail Pendapatan</Text>
        <View style={{ width: 28 }} />
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* KARTU PERANGKAT (MINIMALIS) */}
        <Animated.View entering={FadeInUp} style={styles.deviceCard}>
          <Image source={imageSource} style={styles.deviceImage} resizeMode="contain" />
          <View style={styles.deviceInfo}>
            <Text style={styles.deviceName}>{device?.device_name || "-"}</Text>
            <Text style={styles.devicePhone}>{device?.phone_number || "-"}</Text>
            <View style={[styles.statusBadge, { backgroundColor: device?.is_active ? COLORS.success : COLORS.danger }]}>
              <Text style={styles.statusText}>{device?.is_active ? "Aktif" : "Nonaktif"}</Text>
            </View>
          </View>
        </Animated.View>

        {/* KARTU TOTAL PENDAPATAN */}
        <Animated.View entering={FadeInUp.delay(50)} style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Pendapatan</Text>
          <Text style={styles.totalValue}>Rp {totalDeviceIncome.toLocaleString("id-ID")}</Text>
        </Animated.View>

        {/* TAB FILTER & GRAFIK */}
        <Animated.View entering={FadeInUp.delay(100)}>
          <View style={styles.filterContainer}>
            {[
              { id: "7days", label: "7 Hari" },
              { id: "month", label: "Bulan Ini" },
              { id: "90days", label: "90 Hari" },
            ].map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.filterChip, periodFilter === item.id && styles.filterChipActive]}
                onPress={() => { animateLayout(); setPeriodFilter(item.id as any); }}
              >
                <Text style={[styles.filterChipText, periodFilter === item.id && styles.filterChipTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.chartCard}>
            {chartData.length > 0 ? (
              <BarChart
                data={chartData}
                height={180}
                barWidth={22}
                spacing={20}
                noOfSections={5}
                yAxisThickness={0}
                xAxisThickness={1}
                xAxisColor="#E5E7EB"
                yAxisTextStyle={{ color: COLORS.textMuted, fontSize: 10 }}
                xAxisLabelTextStyle={{ color: COLORS.textMuted, fontSize: 10 }}
                isAnimated
              />
            ) : (
              <EmptyState title="Belum Ada Data" subtitle="Tidak ada grafik pada periode ini" />
            )}
          </View>
        </Animated.View>

        {/* RIWAYAT PENDAPATAN */}
        <Animated.View entering={FadeInUp.delay(150)} style={styles.historySection}>
          <Text style={styles.historyTitle}>Riwayat Pendapatan</Text>
          
          {deviceIncomes.length === 0 ? (
            <EmptyState title="Belum Ada Aktivitas" subtitle="Tidak ada riwayat" />
          ) : (
            deviceIncomes.slice(0, 30).map((item: any, index: number) => (
              <View key={item.id || index} style={styles.historyItem}>
                <Text style={styles.historyDate}>
                  {new Date(item.trx_date).toLocaleDateString("id-ID", {
                    day: "numeric", month: "numeric", year: "numeric"
                  })}
                </Text>
                <Text style={styles.historyAmount}>+ Rp {Number(item.amount).toLocaleString("id-ID")}</Text>
              </View>
            ))
          )}
        </Animated.View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingTop: 50 },
  centerContainer: { flex: 1, justifyContent: "center", paddingHorizontal: 20 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 16, zIndex: 10 },
  backBtn: { padding: 4 },
  title: { fontSize: 18, fontWeight: "700", color: COLORS.text },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  
  // KARTU PERANGKAT
  deviceCard: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 20, flexDirection: "row", alignItems: "center", ...SHADOW.card, marginBottom: 16 },
  deviceImage: { width: 50, height: 80, marginRight: 20 },
  deviceInfo: { flex: 1 },
  deviceName: { fontSize: 18, fontWeight: "800", color: COLORS.text, marginBottom: 4 },
  devicePhone: { fontSize: 14, color: COLORS.textMuted, marginBottom: 8 },
  statusBadge: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: "#FFFFFF", fontSize: 11, fontWeight: "700" },

  // KARTU TOTAL
  totalCard: { backgroundColor: COLORS.primary, borderRadius: 24, padding: 24, marginBottom: 16, ...SHADOW.card },
  totalLabel: { color: "#FFFFFF", fontSize: 13, marginBottom: 6 },
  totalValue: { color: "#FFFFFF", fontSize: 32, fontWeight: "800" },

  // FILTER & CHART
  filterContainer: { flexDirection: "row", gap: 10, marginBottom: 16 },
  filterChip: { paddingHorizontal: 18, paddingVertical: 8, backgroundColor: "#FFFFFF", borderRadius: 20, borderWidth: 1, borderColor: "#E5E7EB" },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterChipText: { fontSize: 12, fontWeight: "600", color: COLORS.textMuted },
  filterChipTextActive: { color: "#FFFFFF" },
  chartCard: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 20, paddingTop: 30, ...SHADOW.card, marginBottom: 24 },

  // RIWAYAT
  historySection: { marginTop: 8 },
  historyTitle: { fontSize: 16, fontWeight: "700", color: COLORS.text, marginBottom: 16 },
  historyItem: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 18, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, ...SHADOW.card, elevation: 2 },
  historyDate: { fontSize: 14, color: COLORS.textMuted, fontWeight: "500" },
  historyAmount: { fontSize: 15, fontWeight: "700", color: COLORS.success },
});
