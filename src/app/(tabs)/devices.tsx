import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Filter, Search } from "lucide-react-native";
import React, { useMemo, useState } from "react";

import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import EmptyState from "../../components/ui/EmptyState";
import { getDevicesWithBalance } from "../../features/devices/api";
import { COLORS } from "../../theme";

const BRAND_IMAGES: Record<string, any> = {
  Samsung: require("../../../assets/devices/samsung.png"),
  Oppo: require("../../../assets/devices/oppo.png"),
  Vivo: require("../../../assets/devices/vivo.png"),
  Xiaomi: require("../../../assets/devices/xiaomi.png"),
  Realme: require("../../../assets/devices/realme.png"),
  Infinix: require("../../../assets/devices/infinix.png"),
};

const DEFAULT_IMAGE = require("../../../assets/devices/default.png");

// 1. DATA FILTER TERSTRUKTUR DENGAN KATEGORI DAN TYPE STRICT
const BRANDS = [
  "Samsung",
  "Oppo",
  "Vivo",
  "Xiaomi",
  "Realme",
  "Infinix",
].sort();

type FilterItem = {
  type: "header" | "option";
  label: string;
  value: string;
};

const FILTER_OPTIONS: FilterItem[] = [
  { type: "option", label: "Semua", value: "Semua" },
  {
    type: "option",
    label: "Pendapatan Tertinggi",
    value: "Pendapatan Tertinggi",
  },

  // Header diberi value semu agar TypeScript tidak error
  { type: "header", label: "STATUS", value: "header-status" },
  { type: "option", label: "Aktif", value: "Aktif" },
  { type: "option", label: "Nonaktif", value: "Nonaktif" },

  // Header diberi value semu agar TypeScript tidak error
  { type: "header", label: "MERK HP", value: "header-merk" },

  // Solusi Error: Menambahkan penegasan tipe data "FilterItem" di dalam map
  ...BRANDS.map((b): FilterItem => ({ type: "option", label: b, value: b })),
];

export default function DevicesScreen() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [showFilter, setShowFilter] = useState(false);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["devices"],
    queryFn: getDevicesWithBalance,
  });

  const devices = data || [];

  const filteredDevices = useMemo(() => {
    let result = [...devices];

    // Filter berdasarkan opsi yang dipilih
    if (activeFilter === "Aktif") {
      result = result.filter((item) => item.is_active === true);
    } else if (activeFilter === "Nonaktif") {
      result = result.filter((item) => item.is_active === false);
    } else if (BRANDS.includes(activeFilter)) {
      result = result.filter((item) => item.brand === activeFilter);
    }

    // Sort untuk Pendapatan Tertinggi
    if (activeFilter === "Pendapatan Tertinggi") {
      result.sort((a, b) => Number(b.balance || 0) - Number(a.balance || 0));
    }

    // Terapkan Pencarian Teks
    if (search) {
      result = result.filter((item) =>
        item.device_name?.toLowerCase().includes(search.toLowerCase()),
      );
    }

    return result;
  }, [devices, search, activeFilter]);

  const renderItem = ({ item, index }: any) => {
    const imageSource = BRAND_IMAGES[item.brand] || DEFAULT_IMAGE;

    return (
      <Animated.View entering={FadeInUp.delay(index * 50)}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.card}
          onPress={() =>
            router.push({
              pathname: "/device-detail",
              params: { id: item.id },
            })
          }
        >
          <Image
            source={imageSource}
            resizeMode="contain"
            style={styles.deviceImage}
          />

          <View style={styles.content}>
            <View style={styles.topRow}>
              <Text numberOfLines={1} style={styles.deviceName}>
                {item.device_name}
              </Text>

              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: item.is_active
                      ? COLORS.success
                      : COLORS.danger,
                  },
                ]}
              />
            </View>

            <Text style={styles.wallet}>{item.ewallet || "-"}</Text>

            <Text style={styles.balance}>
              Rp {Number(item.balance || 0).toLocaleString("id-ID")}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        <Animated.View entering={FadeInDown} style={styles.header}>
          <Text style={styles.title}>Daftar Perangkat</Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(100)}
          style={styles.searchRow}
        >
          <View style={styles.searchBox}>
            <Search size={18} color={COLORS.textMuted} />

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Cari perangkat..."
              placeholderTextColor={COLORS.textMuted}
              style={styles.searchInput}
            />
          </View>

          {/* Tombol Filter dengan Lingkaran Biru dan Shadow */}
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setShowFilter(true)}
          >
            <Filter size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(120)} style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total perangkat</Text>
          <Text style={styles.totalValue}>{filteredDevices.length}</Text>
        </Animated.View>

        {filteredDevices.length === 0 ? (
          <Animated.View
            entering={FadeInUp.delay(150)}
            style={{
              flex: 1,
              justifyContent: "center",
              paddingHorizontal: 20,
              marginTop: 40,
            }}
          >
            <EmptyState
              title="Belum Ada Perangkat"
              subtitle="Data tidak ditemukan atau filter kosong"
            />
          </Animated.View>
        ) : (
          <FlatList
            data={filteredDevices}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
            }
          />
        )}
      </View>

      {/* --- MENU DROPDOWN FILTER MELAYANG --- */}
      <Modal visible={showFilter} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilter(false)}
        >
          <View style={styles.dropdownMenu}>
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
              {FILTER_OPTIONS.map((item) => {
                // Render jika tipe item adalah Header
                if (item.type === "header") {
                  return (
                    <Text key={item.value} style={styles.dropdownHeader}>
                      {item.label}
                    </Text>
                  );
                }

                // Render jika tipe item adalah Option
                const isActive = activeFilter === item.value;
                return (
                  <TouchableOpacity
                    key={item.value}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setActiveFilter(item.value);
                      setShowFilter(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        isActive && styles.dropdownItemTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {isActive && <View style={styles.activeDot} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 16,
  },

  searchRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 10,
    alignItems: "center",
  },

  searchBox: {
    flex: 1,
    height: 54,
    backgroundColor: "#e8e8e8",
    borderRadius: 30,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e8e8e8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 3,
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: COLORS.text,
  },

  // --- STYLE TOMBOL FILTER KEMBALI KE LINGKARAN BIRU ---
  filterBtn: {
    width: 54,
    height: 54,
    borderRadius: 30, // Mengikuti radius searchBox agar serasi
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 3,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 12,
  },

  totalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },

  totalValue: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.primary,
  },

  list: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 3,
  },

  deviceImage: {
    width: 72,
    height: 72,
    marginRight: 14,
  },

  content: {
    flex: 1,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },

  deviceName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginRight: 10,
  },

  wallet: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 6,
  },

  balance: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.primary,
  },

  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },

  // --- STYLE DROPDOWN MELAYANG ---
  modalOverlay: {
    flex: 1,
    backgroundColor: "transparent",
  },

  dropdownMenu: {
    position: "absolute",
    top: 165,
    right: 20,
    width: 220,
    maxHeight: 350,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
  },

  dropdownHeader: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.text,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 6,
    letterSpacing: 0.5,
  },

  dropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },

  dropdownItemText: {
    fontSize: 12,
    color: "#bcbcbc",
    fontWeight: "500",
  },

  dropdownItemTextActive: {
    color: COLORS.primary,
    fontWeight: "800",
  },

  activeDot: {
    width: 8,
    height: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
});
