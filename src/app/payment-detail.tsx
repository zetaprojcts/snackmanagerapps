
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";

import {
  ChevronLeft,
  Mail,
  Smartphone,
  Wallet,
} from "lucide-react-native";

import React from "react";

import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Animated, {
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";

import EmptyState from "../components/ui/EmptyState";

import {
  BalanceCardSkeleton,
  DeviceCardSkeleton,
} from "../components/ui/Skeleton";

import { getPaymentById } from "../features/payment/api";

import {
  COLORS,
  SHADOW,
} from "../theme";

const BRAND_IMAGES: Record<
  string,
  any
> = {
  Samsung: require("../../assets/devices/samsung.png"),
  Oppo: require("../../assets/devices/oppo.png"),
  Vivo: require("../../assets/devices/vivo.png"),
  Xiaomi: require("../../assets/devices/xiaomi.png"),
  Realme: require("../../assets/devices/realme.png"),
  Infinix: require("../../assets/devices/infinix.png"),
};

const DEFAULT_IMAGE = require(
  "../../assets/devices/default.png",
);

export default function PaymentDetail() {
  const { id } =
    useLocalSearchParams();

  const router =
    useRouter();

  const {
    data,
    isLoading,
  } = useQuery({
    queryKey: [
      "payment-detail",
      id,
    ],
    queryFn: () =>
      getPaymentById(
        id as string,
      ),
  });

  const device =
    data?.devices;

  const imageSource =
    BRAND_IMAGES[
      device?.brand || ""
    ] || DEFAULT_IMAGE;

  if (isLoading) {
    return (
      <ScrollView
        style={
          styles.container
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        <View
          style={
            styles.header
          }
        >
          <Text
            style={
              styles.title
            }
          >
            Detail Payment
          </Text>
        </View>

        <DeviceCardSkeleton />

        <View
          style={{
            height: 16,
          }}
        />

        <BalanceCardSkeleton />

        <View
          style={{
            height: 16,
          }}
        />

        <DeviceCardSkeleton />
      </ScrollView>
    );
  }

  if (!data) {
    return (
      <View
        style={
          styles.centerContainer
        }
      >
        <EmptyState
          title="Data Tidak Ditemukan"
          subtitle="Payment tidak tersedia"
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={
        styles.container
      }
      showsVerticalScrollIndicator={
        false
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
        <TouchableOpacity
          onPress={() =>
            router.back()
          }
        >
          <ChevronLeft
            size={24}
            color={
              COLORS.text
            }
          />
        </TouchableOpacity>

        <Text
          style={
            styles.title
          }
        >
          Detail Payment
        </Text>

        <View
          style={{
            width: 24,
          }}
        />
      </Animated.View>

      <Animated.View
        entering={
          FadeInUp
        }
        style={
          styles.deviceCard
        }
      >
        <View
          style={
            styles.deviceTop
          }
        >
          <Image
            source={
              imageSource
            }
            style={
              styles.deviceImage
            }
            resizeMode="contain"
          />

          <View
            style={
              styles.deviceInfo
            }
          >
            <Text
              style={
                styles.deviceName
              }
            >
              {device?.device_name ||
                "-"}
            </Text>

            <Text
              style={
                styles.deviceBrand
              }
            >
              {device?.brand ||
                "-"}
            </Text>
          </View>
        </View>

        <View
          style={
            styles.divider
          }
        />

        <View
          style={
            styles.infoRow
          }
        >
          <Smartphone
            size={16}
            color={
              COLORS.textMuted
            }
          />

          <Text
            style={
              styles.infoText
            }
          >
            {device?.phone_number ||
              "-"}
          </Text>
        </View>

        <View
          style={
            styles.infoRow
          }
        >
          <Mail
            size={16}
            color={
              COLORS.textMuted
            }
          />

          <Text
            style={
              styles.infoText
            }
          >
            {device?.email ||
              "-"}
          </Text>
        </View>

        <View
          style={
            styles.infoRow
          }
        >
          <Wallet
            size={16}
            color={
              COLORS.textMuted
            }
          />

          <Text
            style={
              styles.infoText
            }
          >
            {device?.ewallet ||
              "-"}
          </Text>
        </View>
      </Animated.View>

      <Animated.View
        entering={FadeInUp.delay(
          100,
        )}
        style={
          styles.amountCard
        }
      >
        <Text
          style={
            styles.amountLabel
          }
        >
          Total Penarikan
        </Text>

        <Text
          style={
            styles.amountValue
          }
        >
          Rp{" "}
          {Number(
            data.gross_amount ||
              0,
          ).toLocaleString(
            "id-ID",
          )}
        </Text>
      </Animated.View>
      <Animated.View
        entering={FadeInUp.delay(
          150,
        )}
        style={
          styles.detailCard
        }
      >
        <Text
          style={
            styles.sectionTitle
          }
        >
          Detail Penarikan
        </Text>

        <View
          style={
            styles.detailRow
          }
        >
          <Text
            style={
              styles.detailLabel
            }
          >
            Gross Amount
          </Text>

          <Text
            style={
              styles.detailValue
            }
          >
            Rp{" "}
            {Number(
              data.gross_amount ||
                0,
            ).toLocaleString(
              "id-ID",
            )}
          </Text>
        </View>

        <View
          style={
            styles.divider
          }
        />

        <View
          style={
            styles.detailRow
          }
        >
          <Text
            style={
              styles.detailLabel
            }
          >
            Admin Fee
          </Text>

          <Text
            style={
              styles.detailValueDanger
            }
          >
            Rp{" "}
            {Number(
              data.admin_fee ||
                0,
            ).toLocaleString(
              "id-ID",
            )}
          </Text>
        </View>

        <View
          style={
            styles.divider
          }
        />

        <View
          style={
            styles.detailRow
          }
        >
          <Text
            style={
              styles.detailLabel
            }
          >
            Net Amount
          </Text>

          <Text
            style={
              styles.detailValueSuccess
            }
          >
            Rp{" "}
            {Number(
              data.net_amount ||
                0,
            ).toLocaleString(
              "id-ID",
            )}
          </Text>
        </View>
      </Animated.View>

      <Animated.View
        entering={FadeInUp.delay(
          200,
        )}
        style={
          styles.detailCard
        }
      >
        <Text
          style={
            styles.sectionTitle
          }
        >
          Informasi Transaksi
        </Text>

        <View
          style={
            styles.detailRow
          }
        >
          <Text
            style={
              styles.detailLabel
            }
          >
            Tanggal
          </Text>

          <Text
            style={
              styles.detailValue
            }
          >
            {new Date(
              data.trx_date,
            ).toLocaleDateString(
              "id-ID",
              {
                day: "2-digit",
                month:
                  "long",
                year: "numeric",
              },
            )}
          </Text>
        </View>

        <View
          style={
            styles.divider
          }
        />

        <View
          style={
            styles.detailRow
          }
        >
          <Text
            style={
              styles.detailLabel
            }
          >
            ID Payment
          </Text>

          <Text
            style={
              styles.detailValue
            }
          >
            {data.id}
          </Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      COLORS.background,
    paddingTop: 55,
  },

  centerContainer: {
    flex: 1,
    justifyContent:
      "center",
    paddingHorizontal: 20,
    backgroundColor:
      COLORS.background,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },

  title: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text,
  },

  deviceCard: {
    backgroundColor:
      "#FFFFFF",
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 20,
    ...SHADOW.card,
  },

  deviceTop: {
    flexDirection: "row",
    alignItems: "center",
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

  deviceBrand: {
    marginTop: 4,
    fontSize: 13,
    color:
      COLORS.textMuted,
  },

  divider: {
    height: 1,
    backgroundColor:
      COLORS.border,
    marginVertical: 16,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },

  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },

  amountCard: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor:
      COLORS.warning,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    ...SHADOW.card,
  },

  amountLabel: {
    color:
      "rgba(255,255,255,0.85)",
    fontSize: 14,
  },

  amountValue: {
    marginTop: 8,
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
  },

  detailCard: {
    backgroundColor:
      "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 24,
    padding: 20,
    ...SHADOW.card,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 16,
  },

  detailRow: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
  },

  detailLabel: {
    fontSize: 14,
    color:
      COLORS.textMuted,
  },

  detailValue: {
    flex: 1,
    textAlign: "right",
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },

  detailValueDanger: {
    flex: 1,
    textAlign: "right",
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.danger,
  },

  detailValueSuccess: {
    flex: 1,
    textAlign: "right",
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.success,
  },
});
