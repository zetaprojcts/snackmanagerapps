import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs, useRouter } from "expo-router";
import {
  Activity,
  ArrowDownToLine,
  Plus,
  Smartphone,
  Wallet,
  type LucideIcon,
} from "lucide-react-native";
import React, { useEffect } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS, RADIUS } from "@/src/theme";

const TAB_ITEMS: {
  icon?: LucideIcon;
  label: string;
  route: "devices" | "income" | "action" | "payment" | "balance";
}[] = [
  { route: "devices", label: "Perangkat", icon: Smartphone },
  { route: "income", label: "Pendapatan", icon: ArrowDownToLine },
  { route: "action", label: "Tambah" },
  { route: "payment", label: "Penarikan", icon: Wallet },
  { route: "balance", label: "Saldo", icon: Activity },
];

const ACTIVE_INDICATOR_WIDTH = 58;

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen name="devices" options={{ title: "Perangkat" }} />
      <Tabs.Screen name="income" options={{ title: "Pendapatan" }} />
      <Tabs.Screen name="action" options={{ title: "Tambah" }} />
      <Tabs.Screen name="payment" options={{ title: "Penarikan" }} />
      <Tabs.Screen name="balance" options={{ title: "Saldo" }} />
      <Tabs.Screen name="index" options={{ href: null }} />
    </Tabs>
  );
}

function AppTabBar({ navigation, state }: BottomTabBarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const activeRoute = state.routes[state.index]?.name;
  const barWidth = useSharedValue(0);
  const activeSlot = useSharedValue(getActiveSlot(activeRoute));

  useEffect(() => {
    activeSlot.value = withTiming(getActiveSlot(activeRoute), {
      duration: 280,
      easing: Easing.out(Easing.cubic),
    });
  }, [activeRoute, activeSlot]);

  const indicatorStyle = useAnimatedStyle(() => {
    const slotWidth = barWidth.value / TAB_ITEMS.length;

    return {
      opacity: barWidth.value > 0 ? 1 : 0,
      transform: [
        {
          translateX:
            activeSlot.value * slotWidth +
            (slotWidth - ACTIVE_INDICATOR_WIDTH) / 2,
        },
      ],
    };
  });

  return (
    <View
      onLayout={(event) => {
        barWidth.value = event.nativeEvent.layout.width;
      }}
      style={[
        styles.tabBar,
        {
          height: 62 + Math.max(insets.bottom, 10),
          paddingBottom: Math.max(insets.bottom, 10),
        },
      ]}
    >
      <Animated.View style={[styles.activeIndicator, indicatorStyle]} />

      {TAB_ITEMS.map((item) => {
        if (item.route === "action") {
          return (
            <TouchableOpacity
              accessibilityLabel={item.label}
              accessibilityRole="button"
              activeOpacity={0.85}
              key={item.route}
              onPress={() => router.push("/action-sheet-modal")}
              style={styles.tabButton}
            >
              <View style={styles.fab}>
                <Plus color="#FFFFFF" size={30} />
              </View>
            </TouchableOpacity>
          );
        }

        const route = state.routes.find((candidate) => candidate.name === item.route);
        const isActive = activeRoute === item.route;
        const Icon = item.icon!;

        return (
          <TouchableOpacity
            accessibilityLabel={item.label}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            activeOpacity={0.75}
            key={item.route}
            onPress={() => {
              if (!route) return;

              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isActive && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            }}
            style={styles.tabButton}
          >
            <Icon
              color={isActive ? COLORS.primary : COLORS.textMuted}
              size={23}
              strokeWidth={2.2}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function getActiveSlot(routeName?: string) {
  const index = TAB_ITEMS.findIndex((item) => item.route === routeName);
  return index >= 0 && index !== 2 ? index : 0;
}

const styles = StyleSheet.create({
  tabBar: {
    position: "relative",
    flexDirection: "row",
    alignItems: "flex-start",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: "#FFFFFF",
  },
  activeIndicator: {
    position: "absolute",
    top: 9,
    left: 0,
    width: ACTIVE_INDICATOR_WIDTH,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: "rgba(13, 71, 255, 0.12)",
  },
  tabButton: {
    flex: 1,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  fab: {
    position: "absolute",
    top: -38,
    width: 68,
    height: 68,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: RADIUS.full,
    borderWidth: 8,
    borderColor: "#FFFFFF",
    backgroundColor: COLORS.primary,
  },
});
