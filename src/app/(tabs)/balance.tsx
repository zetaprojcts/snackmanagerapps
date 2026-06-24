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
                    style={[styles.cardValuePayment, { color: COLORS.
