import DateTimePicker from "@react-native-community/datetimepicker";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Calendar, ChevronLeft, Edit, Mail, Wallet } from "lucide-react-native";
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
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";

import EmptyState from "../components/ui/EmptyState";
import { DeviceCardSkeleton } from "../components/ui/Skeleton";
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
    "7days" | "this_month" | "last_month" | "custom"
  >("7days");
  const [showCustomDateModal, setShowCustomDateModal] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<Date>(new Date());
  const [customEndDate, setCustomEndDate] = useState<Date>(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
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
      for (let i = 1; i <= daysInMonth; i++)
        dates.push(new Date(year, month, i));
    } else if (periodFilter === "last_month") {
      const year = now.getFullYear();
      const month = now.getMonth() - 1;
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++)
        dates.push(new Date(year, month, i));
    } else if (periodFilter === "custom" && customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(customEndDate);
      end.setHours(0, 0, 0, 0);
      let current = new Date(start);
      while (current <= end) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
    }
    return dates;
  };

  const chartSourceRaw = metricTab === "income" ? incomes : payments;
  const datesArray = getDatesArray();
  const currentBarWidth = periodFilter === "7days" ? 22 : 16;

  const chartData = datesArray.map((date, index) => {
    const dateString = date.toLocaleDateString("en-CA");
    const itemsForDate = chartSourceRaw.filter((item: any) => {
      if (!item?.trx_date) return false;
      const itemDate = new Date(item.trx_date).toLocaleDateString("en-CA");
      return itemDate === dateString;
    });

    const totalValue = itemsForDate.reduce((sum: number, item: any) => {
      return (
        sum + Number(metricTab === "income" ? item.amount : item.gross_amount)
      );
    }, 0);

    let label = date.getDate().toString();
    if (periodFilter === "7days")
      label = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"][index];
    else if (periodFilter === "custom" && datesArray.length <= 7)
      label = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"][date.getDay()];

    const isSelected = selectedIndex === index;
    const activeColor =
      metricTab === "income" ? COLORS.primary : COLORS.warning;

    return {
      value: totalValue,
      label: label,
      frontColor: totalValue === 0 ? "#E2E8F0" : activeColor,
      topLabelComponent: () => {
        if (!isSelected || totalValue === 0) return null;
        return (
          <View
            style={{
              width: currentBarWidth,
              alignItems: "center",
              overflow: "visible",
            }}
          >
            <View
              style={{
                position: "absolute",
                bottom: 4,
                width: 150,
                alignItems: "center",
                zIndex: 999,
              }}
            >
              <Animated.View
                entering={FadeIn.duration(200)}
                style={styles.floatingTooltip}
              >
                <Text style={styles.floatingTooltipText} numberOfLines={1}>
                  Rp {totalValue.toLocaleString("id-ID")}
                </Text>
              </Animated.View>
            </View>
          </View>
        );
      },
      opacity: selectedIndex === null || isSelected ? 1 : 0.4,
    };
  });

  const maxDataValue = chartData.reduce(
    (max, item) => Math.max(max, item.value),
    0,
  );
  const calculateYAxisStep = (max: number) => {
    if (max <= 0) return 10000;
    const roughStep = max / 5;
    const mag = Math.pow(10, Math.floor(Math.log10(roughStep)));
    const normalized = roughStep / mag;
    let niceMultiplier =
      normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
    return niceMultiplier * mag;
  };
  const yAxisStep = calculateYAxisStep(maxDataValue);
  const chartMaxValue = yAxisStep * 5;
  const yAxisLabelTexts = [
    "0",
    (yAxisStep * 1).toLocaleString("id-ID"),
    (yAxisStep * 2).toLocaleString("id-ID"),
    (yAxisStep * 3).toLocaleString("id-ID"),
    (yAxisStep * 4).toLocaleString("id-ID"),
    (yAxisStep * 5).toLocaleString("id-ID"),
  ];

  const activities = useMemo(() => {
    const list =
      metricTab === "income"
        ? incomes.map((i: any) => ({
            type: "income",
            amount: Number(i.amount),
            trx_date: i.trx_date,
          }))
        : payments.map((p: any) => ({
            type: "payment",
            amount: Number(p.gross_amount),
            trx_date: p.trx_date,
          }));
    return list
      .sort(
        (a, b) =>
          new Date(b.trx_date).getTime() - new Date(a.trx_date).getTime(),
      )
      .slice(0, 10);
  }, [incomes, payments, metricTab]);

  const formatDateDisplay = (date: Date) =>
    date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (selectedDate) setCustomStartDate(selectedDate);
  };
  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (selectedDate) setCustomEndDate(selectedDate);
  };

  if (isLoading)
    return (
      <View style={styles.container}>
        <DeviceCardSkeleton />
      </View>
    );
  if (!device)
    return (
      <View style={styles.container}>
        <EmptyState
          title="Device Tidak Ditemukan"
          subtitle="Data perangkat tidak tersedia"
        />
      </View>
    );

  const isIncomeActive = metricTab === "income";
  const isPaymentActive = metricTab === "payment";

  return (
    <>
      <View style={styles.container}>
        <Animated.View entering={FadeInDown} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Detail Perangkat</Text>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/edit-device",
                params: { id: device.id },
              })
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

          <Animated.View
            entering={FadeInUp.delay(150)}
            style={styles.summaryRow}
          >
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
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chartFilterContainer}
            >
              {[
                { id: "7days", label: "7 Hari" },
                { id: "this_month", label: "Bulan Ini" },
                { id: "last_month", label: "Bulan Lalu" },
                { id: "custom", label: "Tanggal...", isCustom: true },
              ].map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.filterChip,
                    periodFilter === item.id && styles.filterChipActive,
                  ]}
                  onPress={() => {
                    animateLayout();
                    if (item.isCustom) setShowCustomDateModal(true);
                    else setPeriodFilter(item.id as any);
                    setSelectedIndex(null);
                  }}
                >
                  {item.isCustom && (
                    <Calendar
                      size={12}
                      color={
                        periodFilter === item.id ? "#FFF" : COLORS.textMuted
                      }
                      style={{ marginRight: 6 }}
                    />
                  )}
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
            </ScrollView>

            <View style={styles.chartContainer}>
              <BarChart
                key={`chart-${metricTab}-${periodFilter}-${chartData.length}`}
                data={chartData}
                height={160}
                barWidth={currentBarWidth}
                spacing={periodFilter === "7days" ? 20 : 12}
                initialSpacing={15}
                endSpacing={10}
                noOfSections={5}
                maxValue={chartMaxValue}
                yAxisLabelTexts={yAxisLabelTexts}
                yAxisLabelWidth={45}
                yAxisThickness={0}
                xAxisThickness={1}
                rulesLength={285}
                xAxisLength={285}
                xAxisColor="#E2E8F0"
                isAnimated
                animationDuration={800}
                xAxisLabelTextStyle={{
                  color: COLORS.textMuted,
                  fontSize: 10,
                  textAlign: "center",
                }}
                yAxisTextStyle={{ color: COLORS.textMuted, fontSize: 11 }}
                onPress={(item: any, index: number) => {
                  animateLayout();
                  setSelectedIndex(selectedIndex === index ? null : index);
                }}
              />
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
                subtitle={`Tidak ada data ${isIncomeActive ? "pendapatan" : "penarikan"}`}
              />
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
      <Modal visible={showCustomDateModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pilih Rentang Tanggal</Text>
            <Text style={styles.modalLabel}>Dari Tanggal</Text>
            <TouchableOpacity
              style={styles.modalInputBox}
              onPress={() => setShowStartPicker(true)}
            >
              <Text style={styles.modalInputText}>
                {formatDateDisplay(customStartDate)}
              </Text>
            </TouchableOpacity>
            <Text style={styles.modalLabel}>Sampai Tanggal</Text>
            <TouchableOpacity
              style={styles.modalInputBox}
              onPress={() => setShowEndPicker(true)}
            >
              <Text style={styles.modalInputText}>
                {formatDateDisplay(customEndDate)}
              </Text>
            </TouchableOpacity>
            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalBtnCancel}
                onPress={() => setShowCustomDateModal(false)}
              >
                <Text style={styles.modalBtnCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalBtnSave}
                onPress={() => {
                  setPeriodFilter("custom");
                  setShowCustomDateModal(false);
                }}
              >
                <Text style={styles.modalBtnSaveText}>Terapkan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {showStartPicker && (
        <DateTimePicker
          value={customStartDate}
          mode="date"
          display="default"
          onChange={handleStartDateChange}
        />
      )}
      {showEndPicker && (
        <DateTimePicker
          value={customEndDate}
          mode="date"
          display="default"
          onChange={handleEndDateChange}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 55,
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
  },
  chartFilterContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
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
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
    paddingTop: 40,
    marginHorizontal: 20,
    ...SHADOW.card,
  },
  floatingTooltip: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  floatingTooltipText: {
    color: COLORS.text,
    fontSize: 7,
    fontWeight: "800",
    textAlign: "center",
  },
  activitySection: {
    marginHorizontal: 20,
    marginTop: 24,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    ...SHADOW.card,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  modalInputBox: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },
  modalInputText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "500",
  },
  modalActionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 10,
  },
  modalBtnCancel: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
  },
  modalBtnCancelText: {
    color: COLORS.textMuted,
    fontWeight: "700",
  },
  modalBtnSave: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  modalBtnSaveText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
