import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { COLORS } from "../../theme";

type SkeletonProps = {
  width: number | string;
  height: number;
  style?: any;
};

export const Skeleton = ({ width, height, style }: SkeletonProps) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, {
        duration: 800,
      }),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          width,
          height,
          backgroundColor: COLORS.border,
          borderRadius: 8,
        },
        style,
      ]}
    />
  );
};

export const BalanceCardSkeleton = () => {
  return (
    <View style={styles.balanceCard}>
      <Skeleton width={120} height={14} />

      <Skeleton
        width={"70%"}
        height={34}
        style={{
          marginTop: 12,
        }}
      />
    </View>
  );
};

export const TransactionCardSkeleton = () => {
  return (
    <View style={styles.transactionCard}>
      <Skeleton
        width={42}
        height={42}
        style={{
          borderRadius: 12,
        }}
      />

      <View
        style={{
          flex: 1,
          marginLeft: 12,
        }}
      >
        <Skeleton width={"60%"} height={14} />

        <Skeleton
          width={"40%"}
          height={12}
          style={{
            marginTop: 8,
          }}
        />
      </View>

      <Skeleton width={80} height={14} />
    </View>
  );
};

export const DeviceCardSkeleton = () => {
  return (
    <View style={styles.deviceCard}>
      <Skeleton
        width={72}
        height={72}
        style={{
          borderRadius: 16,
        }}
      />

      <View
        style={{
          flex: 1,
          marginLeft: 14,
        }}
      >
        <Skeleton width={"70%"} height={16} />

        <Skeleton
          width={"50%"}
          height={12}
          style={{
            marginTop: 10,
          }}
        />

        <Skeleton
          width={"40%"}
          height={18}
          style={{
            marginTop: 10,
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  balanceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 20,
  },

  transactionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  deviceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
  },
});
