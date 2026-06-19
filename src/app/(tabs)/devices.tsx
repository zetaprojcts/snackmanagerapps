import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Filter, Search } from "lucide-react-native";
import React, { useMemo, useState } from "react";

import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import Animated, {
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";

import BrandFilterSheet from "../../components/bottom-sheet/BrandFilterSheet";
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

const DEFAULT_IMAGE =
  require("../../../assets/devices/default.png");

export default function DevicesScreen() {
  const router = useRouter();

  const [search, setSearch] =
    useState("");

  const [
    selectedBrand,
    setSelectedBrand,
  ] = useState("Semua");

  const [
    showFilter,
    setShowFilter,
  ] = useState(false);

  const {
    data,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["devices"],
    queryFn:
      getDevicesWithBalance,
  });

  const devices =
    data || [];

  const filteredDevices =
    useMemo(() => {
      let result =
        devices;

      if (
        selectedBrand !==
        "Semua"
      ) {
        result =
          result.filter(
            (item) =>
              item.brand ===
              selectedBrand,
          );
      }

      if (search) {
        result =
          result.filter(
            (item) =>
              item.device_name
                ?.toLowerCase()
                .includes(
                  search.toLowerCase(),
                ),
          );
      }

      return result;
    }, [
      devices,
      search,
      selectedBrand,
    ]);

  const renderItem = ({
    item,
    index,
  }: any) => {
    const imageSource =
      BRAND_IMAGES[
        item.brand
      ] || DEFAULT_IMAGE;

    return (
      <Animated.View
        entering={FadeInUp.delay(
          index * 50,
        )}
      >
        <TouchableOpacity
          activeOpacity={
            0.85
          }
          style={
            styles.card
          }
          onPress={() =>
            router.push({
              pathname:
                "/device-detail",
              params: {
                id: item.id,
              },
            })
          }
        >
          <Image
            source={
              imageSource
            }
            resizeMode="contain"
            style={
              styles.deviceImage
            }
          />

          <View
            style={
              styles.content
            }
          >
            <View
              style={
                styles.topRow
              }
            >
              <Text
                numberOfLines={
                  1
                }
                style={
                  styles.deviceName
                }
              >
                {
                  item.device_name
                }
              </Text>

              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      item.is_active
                        ? COLORS.success
                        : COLORS.danger,
                  },
                ]}
              />
            </View>

            <Text
              style={
                styles.wallet
              }
            >
              {item.ewallet ||
                "-"}
            </Text>

            <Text
              style={
                styles.balance
              }
            >
              Rp{" "}
              {Number(
                item.balance ||
                  0,
              ).toLocaleString(
                "id-ID",
              )}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (isLoading) {
    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <ActivityIndicator
          size="large"
          color={
            COLORS.primary
          }
        />
      </View>
    );
  }

  return (
    <>
      <View
        style={
          styles.container
        }
      >
        <Animated.View
          entering={
            FadeInDown
          }
          style={
            styles.header
          }
        >
          <Text
            style={
              styles.title
            }
          >
            Daftar
            Perangkat
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(
            100,
          )}
          style={
            styles.searchRow
          }
        >
          <View
            style={
              styles.searchBox
            }
          >
            <Search
              size={18}
              color={
                COLORS.textMuted
              }
            />

            <TextInput
              value={
                search
              }
              onChangeText={
                setSearch
              }
              placeholder="Cari perangkat..."
              placeholderTextColor={
                COLORS.textMuted
              }
              style={
                styles.searchInput
              }
            />
          </View>

          <TouchableOpacity
            style={
              styles.filterBtn
            }
            onPress={() =>
              setShowFilter(
                true,
              )
            }
          >
            <Filter
              size={20}
              color="#FFF"
            />
          </TouchableOpacity>
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
              subtitle="Tambahkan perangkat pertama Anda"
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
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
              />
            }
          />
        )}
      </View>

      <BrandFilterSheet
        visible={showFilter}
        selectedBrand={selectedBrand}
        onClose={() => setShowFilter(false)}
        onSelect={(brand) => {
          setSelectedBrand(brand);

          setShowFilter(false);
        }}
      />
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

  statsRow: {
    flexDirection: "row",
    gap: 12,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#FFF",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 3,

    borderRadius: 20,
    padding: 18,
  },

  statsLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 6,
  },

  statsValue: {
    fontSize: 24,
    fontWeight: "800",
  },

  searchRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 10,
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 3,
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: COLORS.text,
  },

  filterBtn: {
    width: 54,
    height: 54,
    borderRadius: 30,
    backgroundColor: COLORS.primary,

    borderColor: "#e8e8e8",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 3,

    justifyContent: "center",
    alignItems: "center",
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
});
