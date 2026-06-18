import { Tabs, useRouter } from "expo-router";
import {
  Activity,
  ArrowDownToLine,
  Plus,
  Smartphone,
  Wallet,
} from "lucide-react-native";
import React from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";

import { COLORS } from "@/src/theme";

export default function TabLayout() {
  const router = useRouter();

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
          height: Platform.OS === "ios" ? 85 : 70,
          paddingBottom: Platform.OS === "ios" ? 25 : 10,
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
