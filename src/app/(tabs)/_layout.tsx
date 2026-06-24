import { Tabs, useRouter } from "expo-router";
import {
    Activity,
    ArrowDownToLine,
    Plus,
    Smartphone,
    Wallet,
} from "lucide-react-native";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
// 1. Import hook Safe Area
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS } from "@/src/theme";

export default function TabLayout() {
  const router = useRouter();

  // 2. Ambil nilai insets (area aman HP)
  const insets = useSafeAreaInsets();

  // 3. Kalkulasi tinggi dan padding dinamis
  // Jika insets.bottom 0 (HP lama), gunakan minimal 10px.
  // Jika HP modern (gesture bar), gunakan insets dari sistem.
  const dynamicPaddingBottom = Math.max(insets.bottom, 10);
  const dynamicHeight = 60 + dynamicPaddingBottom; // 60 adalah tinggi dasar area icon & text

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          // 4. Terapkan nilai dinamis di sini:
          height: dynamicHeight,
          paddingBottom: dynamicPaddingBottom,
          paddingTop: 10,
        },
      }}
    >
      <Tabs.Screen
        name="devices"
        options={{
          title: "Perangkat",
          tabBarIcon: ({ color }) => <Smartphone size={22} color={color} />,
        }}
      />

      <Tabs.Screen
        name="income"
        options={{
          title: "Pendapatan",
          tabBarIcon: ({ color }) => (
            <ArrowDownToLine size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="action"
        options={{
          title: "",
          tabBarButton: () => (
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.fabContainer}
              onPress={() => router.push("/action-sheet-modal")}
            >
              <View style={styles.fab}>
                <Plus size={30} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          ),
        }}
      />

      <Tabs.Screen
        name="payment"
        options={{
          title: "Penarikan",
          tabBarIcon: ({ color }) => <Wallet size={22} color={color} />,
        }}
      />

      <Tabs.Screen
        name="balance"
        options={{
          title: "Saldo",
          tabBarIcon: ({ color }) => <Activity size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    top: -25,
    justifyContent: "center",
    alignItems: "center",
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
});
