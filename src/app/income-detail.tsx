import DateTimePicker from "@react-native-community/datetimepicker";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Calendar, ChevronLeft } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  Image,
  LayoutAnimation,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { BarChart } from "react-native-gifted-charts";
import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";

import EmptyState from "../components/ui/EmptyState";
import { DeviceCardSkeleton } from "../components/ui/Skeleton";
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

  const [periodFilter, setPeriodFilter] = useState<"7days" | "this_month" | "last_month" | "custom">("7days");
  const [showCustomDateModal, setShowCustomDateModal] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<Date>(new Date());
  const [customEndDate, setCustomEndDate] = useState<Date>(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

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

  const deviceIncomes = useMemo(() => {
    if (!allIncomes || !device) return [];
    return allIncomes
      .filter((item: any) => item.device_id === device.id || item.devices?.id === device.id)
      .sort((a: any, b: any) => new Date(b.trx_date).getTime() - new Date(a.trx_date).getTime());
  }, [allIncomes, device]);

  const totalDeviceIncome = useMemo(() => {
    return deviceIncomes.reduce((total: number, item: any) => total + Number(item.amount || 0), 0);
  }, [deviceIncomes]);

  const getDatesArray = () => {
    const dates = [];
    const now = new Date();
    if (periodFilter === "7days") {
      const dayOfWeek = now.getDay();
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() + diffToMonday);
      for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        dates.push(d);
      }
    } else if (periodFilter === "this_month") {
      const year = now.getFullYear();
      const month = now.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) dates.push(new Date(year, month, i));
    } else if (periodFilter === "last_month") {
      const year = now.getFullYear();
      const month = now.getMonth() - 1;
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) dates.push(new Date(year, month, i));
    } else if (periodFilter === "custom" && customStartDate && customEndDate) {
      const start = new Date(customStartDate); start.setHours(0, 0, 0, 0);
      const end = new Date(customEndDate); end.setHours(0, 0, 0, 0);
      let current = new Date(start);
      while (current <= end) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
    }
    return dates;
  };

  const datesArray = getDatesArray();
  const currentBarWidth = periodFilter === "7days" ? 22 : 16;

  const chartData = datesArray.map((date, index) => {
    const dateString = date.toLocaleDateString("en-CA");
    const itemsForDate = deviceIncomes.filter((item: any) => {
      if (!item?.trx_date) return false;
      const itemDate = new Date(item.trx_date).toLocaleDateString("en-CA");
      return itemDate === dateString;
    });

    const totalValue = itemsForDate.reduce((sum: number, item: any) => sum + Number(item.amount), 0);
    let label = date.getDate().toString();
    if (periodFilter === "7days") label = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"][index];
    else if (periodFilter === "custom" && datesArray.length <= 7) label = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"][date.getDay()];

    const isSelected = selectedIndex === index;
    const activeColor = COLORS.primary;

    return {
      value: totalValue,
      label: label,
      frontColor: totalValue === 0 ? "#E2E8F0" : activeColor,
      topLabelComponent: () => {
        if (!isSelected || totalValue === 0) return null;
        return (
          <View style={{ width: currentBarWidth, alignItems: 'center', overflow: 'visible' }}>
            <View style={{ position: "absolute", bottom: 4, width: 150, alignItems: "center", zIndex: 999 }}>
              <Animated.View entering={FadeIn.duration(200)} style={styles.floatingTooltip}>
                <Text style={styles.floatingTooltipText} numberOfLines={1}>Rp {totalValue.toLocaleString("id-ID")}</Text>
              </Animated.View>
            </View>
          </View>
        );
      },
      opacity: selectedIndex === null || isSelected ? 1 : 0.4,
    };
  });

  const maxDataValue = chartData.reduce((max, item) => Math.max(max, item.value), 0);
  const calculateYAxisStep = (max: number) => {
    if (max <= 0) return 10000;
    const roughStep = max / 5;
    const mag = Math.pow(10, Math.floor(Math.log10(roughStep)));
    const normalized = roughStep / mag;
    let niceMultiplier = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
    return niceMultiplier * mag;
  };
  const yAxisStep = calculateYAxisStep(maxDataValue);
  const chartMaxValue = yAxisStep * 5;
  const yAxisLabelTexts = ["0", (yAxisStep * 1).toLocaleString("id-ID"), (yAxisStep * 2).toLocaleString("id-ID"), (yAxisStep * 3).toLocaleString("id-ID"), (yAxisStep * 4).toLocaleString("id-ID"), (yAxisStep * 5).toLocaleString("id-ID")];

  const formatDateDisplay = (date: Date) => date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  const handleStartDateChange = (event: any, selectedDate?: Date) => { setShowStartPicker(false); if (selectedDate) setCustomStartDate(selectedDate); };
  const handleEndDateChange = (event: any, selectedDate?: Date) => { setShowEndPicker(false); if (selectedDate) setCustomEndDate(selectedDate); };

  const isLoading = loadingDetail || loadingAll;

  if (isLoading) return <View style={styles.container}><DeviceCardSkeleton /></View>;
  if (!incomeDetail) return <View style={styles.centerContainer}><EmptyState title="Data Tidak Ditemukan" subtitle="Income tidak tersedia" /></View>;

  return (
    <>
      <View style={styles.container}>
        <Animated.View entering={FadeInDown} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><ChevronLeft size={28} color={COLORS.text} /></TouchableOpacity>
          <Text style={styles.title}>Detail Pendapatan</Text>
          <View style={{ width: 28 }} />
        </Animated.View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Animated.View entering={FadeInUp} style={styles.deviceCard}>
            <Image source={imageSource} style={styles.deviceImage} resizeMode="contain" />
            <View style={styles.deviceInfo}>
              <Text style={styles.deviceName}>{device?.device_name || "-"}</Text>
              <Text style={styles.devicePhone}>{device?.phone_number || "-"}</Text>
              <View style={[styles.statusBadge, { backgroundColor: device?.is_active ? COLORS.success : COLORS.danger }]}><Text style={styles.statusText}>{device?.is_active ? "Aktif" : "Nonaktif"}</Text></View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(50)} style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total Pendapatan</Text>
            <Text style={styles.totalValue}>Rp {totalDeviceIncome.toLocaleString("id-ID")}</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(100)}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
              {[ { id: "7days", label: "7 Hari" }, { id: "this_month", label: "Bulan Ini" }, { id: "last_month", label: "Bulan Lalu" }, { id: "custom", label: "Tanggal...", isCustom: true }, ].map((item) => (
                <TouchableOpacity key={item.id} style={[styles.filterChip, periodFilter === item.id && styles.filterChipActive]} onPress={() => { animateLayout(); if (item.isCustom) setShowCustomDateModal(true); else setPeriodFilter(item.id as any); setSelectedIndex(null); }}>
                  {item.isCustom && <Calendar size={12} color={periodFilter === item.id ? "#FFF" : COLORS.textMuted} style={{ marginRight: 6 }} />}
                  <Text style={[styles.filterChipText, periodFilter === item.id && styles.filterChipTextActive]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.chartContainer}>
              <BarChart
                key={`chart-income-${periodFilter}-${chartData.length}`}
                data={chartData}
                height={160}
                barWidth={currentBarWidth}
                spacing={periodFilter === "7days" ? 20 : 12}
                initialSpacing={35}
                endSpacing={35}
                noOfSections={5}
                maxValue={chartMaxValue}
                yAxisLabelTexts={yAxisLabelTexts}
                yAxisLabelWidth={65}
                yAxisThickness={0}
                xAxisThickness={1}
                xAxisColor="#E2E8F0"
                isAnimated
                animationDuration={800}
                xAxisLabelTextStyle={{ color: COLORS.textMuted, fontSize: 10, textAlign: "center" }}
                yAxisTextStyle={{ color: COLORS.textMuted, fontSize: 11 }}
                onPress={(item: any, index: number) => { animateLayout(); setSelectedIndex(selectedIndex === index ? null : index); }}
              />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(150)} style={styles.historySection}>
            <Text style={styles.historyTitle}>Riwayat Pendapatan</Text>
            {deviceIncomes.length === 0 ? <EmptyState title="Belum Ada Aktivitas" subtitle="Tidak ada riwayat pendapatan" /> : 
              deviceIncomes.slice(0, 30).map((item: any, index: number) => (
                <View key={item.id || index} style={styles.historyItem}>
                  <Text style={styles.historyDate}>{new Date(item.trx_date).toLocaleDateString("id-ID", { day: "numeric", month: "numeric", year: "numeric" })}</Text>
                  <Text style={styles.historyAmount}>+ Rp {Number(item.amount).toLocaleString("id-ID")}</Text>
                </View>
              ))
            }
          </Animated.View>
        </ScrollView>
      </View>

      <Modal visible={showCustomDateModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pilih Rentang Tanggal</Text>
            <Text style={styles.modalLabel}>Dari Tanggal</Text>
            <TouchableOpacity style={styles.modalInputBox} onPress={() => setShowStartPicker(true)}><Text style={styles.modalInputText}>{formatDateDisplay(customStartDate)}</Text></TouchableOpacity>
            <Text style={styles.modalLabel}>Sampai Tanggal</Text>
            <TouchableOpacity style={styles.modalInputBox} onPress={() => setShowEndPicker(true)}><Text style={styles.modalInputText}>{formatDateDisplay(customEndDate)}</Text></TouchableOpacity>
            <View style={styles.modalActionRow}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setShowCustomDateModal(false)}><Text style={styles.modalBtnCancelText}>Batal</Text></TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnSave} onPress={() => { setPeriodFilter("custom"); setShowCustomDateModal(false); }}><Text style={styles.modalBtnSaveText}>Terapkan</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {showStartPicker && <DateTimePicker value={customStartDate} mode="date" display="default" onChange={handleStartDateChange} />}
      {showEndPicker && <DateTimePicker value={customEndDate} mode="date" display="default" onChange={handleEndDateChange} />}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingTop: 50 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 16, zIndex: 10 },
  backBtn: { padding: 4 },
  title: { fontSize: 18, fontWeight: "700", color: COLORS.text },
  scrollContent: { paddingBottom: 40 },
  deviceCard: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 20, marginHorizontal: 20, flexDirection: "row", alignItems: "center", ...SHADOW.card, marginBottom: 16 },
  deviceImage: { width: 50, height: 80, marginRight: 20 },
  deviceInfo: { flex: 1 },
  deviceName: { fontSize: 18, fontWeight: "800", color: COLORS.text, marginBottom: 4 },
  devicePhone: { fontSize: 14, color: COLORS.textMuted, marginBottom: 8 },
  statusBadge: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: "#FFFFFF", fontSize: 11, fontWeight: "700" },
  totalCard: { backgroundColor: COLORS.primary, borderRadius: 24, padding: 24, marginHorizontal: 20, marginBottom: 16, ...SHADOW.card },
  totalLabel: { color: "#FFFFFF", fontSize: 13, marginBottom: 6 },
  totalValue: { color: "#FFFFFF", fontSize: 32, fontWeight: "800" },
  filterContainer: { flexDirection: "row", gap: 10, marginBottom: 16, paddingHorizontal: 20 },
  filterChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 8, backgroundColor: "#FFFFFF", borderRadius: 20, borderWidth: 1, borderColor: "#E5E7EB" },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterChipText: { fontSize: 12, fontWeight: "600", color: COLORS.textMuted },
  filterChipTextActive: { color: "#FFFFFF" },
  chartContainer: { backgroundColor: "#FFFFFF", borderRadius: 24, paddingHorizontal: 20, paddingBottom: 20, paddingTop: 60, marginHorizontal: 20, marginBottom: 24, ...SHADOW.card },
  floatingTooltip: { backgroundColor: "#FFFFFF", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 6, borderWidth: 1, borderColor: "#F1F5F9" },
  floatingTooltipText: { color: COLORS.text, fontSize: 11, fontWeight: "800", textAlign: "center" },
  historySection: { marginTop: 8, marginHorizontal: 20 },
  historyTitle: { fontSize: 16, fontWeight: "700", color: COLORS.text, marginBottom: 16 },
  historyItem: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 18, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, ...SHADOW.card },
  historyDate: { fontSize: 14, color: COLORS.textMuted, fontWeight: "500" },
  historyAmount: { fontSize: 15, fontWeight: "700", color: COLORS.success },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", paddingHorizontal: 20 },
  modalContent: { width: "100%", backgroundColor: "#FFFFFF", borderRadius: 24, padding: 24, ...SHADOW.card },
  modalTitle: { fontSize: 18, fontWeight: "800", color: COLORS.text, marginBottom: 20 },
  modalLabel: { fontSize: 13, fontWeight: "600", color: COLORS.textMuted, marginBottom: 8 },
  modalInputBox: { height: 50, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 16, marginBottom: 16, justifyContent: "center", backgroundColor: "#F8FAFC" },
  modalInputText: { color: COLORS.text, fontSize: 14, fontWeight: "500" },
  modalActionRow: { flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 10 },
  modalBtnCancel: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, backgroundColor: "#F1F5F9" },
  modalBtnCancelText: { color: COLORS.textMuted, fontWeight: "700" },
  modalBtnSave: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, backgroundColor: COLORS.primary },
  modalBtnSaveText: { color: "#FFFFFF", fontWeight: "700" },
});
