import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowDownToLine, ChevronLeft, Smartphone, TrendingUp } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  UIManager,
  LayoutAnimation,
} from "react-native";
import Animated, { FadeInDown, FadeInUp, FadeIn } from "react-native-reanimated";
import { BarChart } from "react-native-gifted-charts";

import EmptyState from "../components/ui/EmptyState";
import {
  BalanceCardSkeleton,
  DeviceCardSkeleton,
  TransactionCardSkeleton,
} from "../components/ui/Skeleton";

import { getIncomeById, fetchIncomes } from "../features/income/api";
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
    
    const filtered = allIncomes.filter(
      (item: any) => item.device_id === device.id || item.devices?.id === device.id
    );

    return filtered.sort(
      (a: any, b: any) => new Date(b.trx_date).getTime() - new Date(a.trx_date).getTime()
    );
  }, [allIncomes, device]);

  // MENGHITUNG TOTAL PENDAPATAN PERANGKAT KESELURUHAN
  const totalDeviceIncome = useMemo(() => {
    return deviceIncomes.reduce((total: number, item: any) => total + Number(item.amount || 0), 0);
  }, [deviceIncomes]);

  const chartData = useMemo(() => {
    const chronological = [...deviceIncomes].reverse();
    return chronological.map((item: any, index: number) => {
      const isSelected = selectedIndex === index;
      const rawValue = Number(item.amount);
      
      return {
        value: rawValue,
        label: new Date(item.trx_date).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "2-digit",
        }),
        frontColor: COLORS.success,
        topLabelComponent: () => {
          if (!isSelected) return null;
          return (
            <Animated.View entering={FadeIn.duration(200)} style={styles.tooltipContainer}>
              <Text style={styles.tooltipText}>
                {rawValue.toLocaleString("id-ID")}
              </Text>
            </Animated.View>
          );
        },
        opacity: selectedIndex === null || isSelected ? 1 : 0.6,
      };
    });
  }, [deviceIncomes, selectedIndex]);

  const recentActivities = useMemo(() => {
    return deviceIncomes.slice(0, 30);
  }, [deviceIncomes]);

  const isLoading = loadingDetail || loadingAll;

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Detail Income</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <DeviceCardSkeleton />
          <View style={{ height: 16 }} />
          <BalanceCardSkeleton />
          
          <View style={styles.chartSection}>
            <View style={[styles.chartContainer, { height: 220, backgroundColor: '#E5E7EB', borderWidth: 0, elevation: 0 }]} />
          </View>

          <View style={styles.activitySection}>
            <View style={{ width: 140, height: 20, backgroundColor: '#E5E7EB', borderRadius: 6, marginBottom: 16 }} />
            <TransactionCardSkeleton />
            <TransactionCardSkeleton />
            <TransactionCardSkeleton />
          </View>
        </ScrollView>
      </View>
    );
  }

  if (!incomeDetail) {
    return (
      <View style={styles.centerContainer}>
        <EmptyState title="Data Tidak Ditemukan" subtitle="Income tidak tersedia" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Detail Income</Text>
        <View style={{ width: 24 }} />
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* KARTU 1: NOMINAL TRANSAKSI YANG SEDANG DIKLIK */}
        <Animated.View entering={FadeInUp} style={styles.amountCard}>
          <ArrowDownToLine size={22} color="#FFFFFF" />
          <Text style={styles.amountLabel}>Nominal Transaksi Ini</Text>
          <Text style={styles.amountValue}>
            Rp {Number(incomeDetail.amount || 0).toLocaleString("id-ID")}
          </Text>
          <View style={styles.dateBadge}>
            <Text style={styles.dateBadgeText}>
              {new Date(incomeDetail.trx_date).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </Text>
          </View>
          <Text style={styles.transactionIdText}>ID: {incomeDetail.id}</Text>
        </Animated.View>

        {/* KARTU 2: TOTAL PENDAPATAN KESELURUHAN DARI PERANGKAT INI */}
        <Animated.View entering={FadeInUp.delay(50)} style={styles.totalHeroCard}>
          <View style={styles.totalHeroHeader}>
            <TrendingUp size={20} color={COLORS.primary} />
            <Text style={styles.totalHeroTitle}>Total Pendapatan Perangkat</Text>
          </View>
          <Text style={styles.totalHeroValue}>
            Rp {totalDeviceIncome.toLocaleString("id-ID")}
          </Text>
        </Animated.View>

        {/* KARTU 3: DETAIL PERANGKAT (Tanpa Email & E-Wallet) */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.deviceCard}>
          <Text style={styles.sectionTitle}>Sumber Perangkat</Text>
          <View style={styles.deviceTop}>
            <Image source={imageSource} style={styles.deviceImage} resizeMode="contain" />
            <View style={styles.deviceInfo}>
              <Text style={styles.deviceName}>{device?.device_name || "-"}</Text>
              <Text style={styles.deviceBrand}>{device?.brand || "-"}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Smartphone size={16} color={COLORS.textMuted} />
            <Text style={styles.infoText}>{device?.phone_number || "-"}</Text>
          </View>
        </Animated.View>

        {/* KARTU 4: GRAFIK (CHART) */}
        <Animated.View entering={FadeInUp.delay(150)} style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Grafik Income Perangkat</Text>
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
              <EmptyState title="Belum Ada Riwayat" subtitle="Tidak ada grafik yang dapat ditampilkan" />
            )}
          </View>
        </Animated.View>

        {/* KARTU 5: RIWAYAT AKTIVITAS (MAX 30) */}
        <Animated.View entering={FadeInUp.delay(200)} style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Riwayat Transaksi (Max 30)</Text>

          {recentActivities.length === 0 ? (
            <Animated.View entering={FadeIn.duration(300)} style={styles.emptyStateContainer}>
              <EmptyState title="Belum Ada Aktivitas" subtitle="Perangkat ini belum memiliki riwayat income lain" />
            </Animated.View>
          ) : (
            recentActivities.map((item: any, index: number) => {
              const isCurrentTransaction = item.id === incomeDetail.id;

              return (
                <Animated.View
                  key={item.id || index}
                  entering={FadeInUp.duration(300).delay(index * 30)}
                  style={[styles.activityCard, isCurrentTransaction && styles.activityCardHighlighted]}
                >
                  <View style={[styles.activityIcon, { backgroundColor: "#D1FAE5" }]}>
                    <ArrowDownToLine size={18} color={COLORS.success} />
                  </View>

                  <View style={styles.activityContent}>
                    <Text style={styles.activityDevice}>
                      {isCurrentTransaction ? "Transaksi Ini" : `Income`}
                    </Text>
                    <Text style={styles.activityDate}>
                      {new Date(item.trx_date).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </Text>
                  </View>

                  <Text style={[styles.activityAmount, { color: COLORS.success }]}>
                    + Rp {Number(item.amount).toLocaleString("id-ID")}
                  </Text>
                </Animated.View>
              );
            })
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
  
  // Style Kartu Nominal Utama
  amountCard: {
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: COLORS.success,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    ...SHADOW.card,
  },
  amountLabel: {
    marginTop: 12,
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
  },
  amountValue: {
    marginTop: 8,
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
  },
  dateBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: 16,
  },
  dateBadgeText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  transactionIdText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    marginTop: 12,
  },

  // Style Kartu Baru (Total Keseluruhan Perangkat)
  totalHeroCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 20,
    padding: 20,
    ...SHADOW.card,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  totalHeroHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  totalHeroTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textMuted,
  },
  totalHeroValue: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.primary,
  },

  // Style Kartu Perangkat
  deviceCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 24,
    padding: 20,
    ...SHADOW.card,
  },
  deviceTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  deviceImage: {
    width: 64,
    height: 64,
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
  deviceBrand: {
    marginTop: 4,
    fontSize: 13,
    color: COLORS.textMuted,
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
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 16,
  },
  chartSection: {
    marginHorizontal: 20,
    marginTop: 24,
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
  },
  activityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    ...SHADOW.card,
  },
  activityCardHighlighted: {
    borderWidth: 1.5,
    borderColor: COLORS.success,
  },
  activityIcon: {
    width: 42,
    height: 42,
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
  emptyStateContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
  },
});
