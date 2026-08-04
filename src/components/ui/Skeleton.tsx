import React, { useEffect } from "react";
import { type DimensionValue, StyleSheet, View } from "react-native";

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { COLORS, RADIUS } from "../../theme";

type SkeletonProps = {
  width: DimensionValue;
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
  }, [opacity]);

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
          borderRadius: RADIUS.control,
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
          borderRadius: RADIUS.control,
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
          borderRadius: RADIUS.control,
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

export const DeviceListSkeleton = ({ count = 5 }: { count?: number }) => (
  <View style={styles.listContent}>
    {Array.from({ length: count }, (_, index) => (
      <DeviceCardSkeleton key={`device-skeleton-${index}`} />
    ))}
  </View>
);

export const TransactionListSkeleton = ({ count = 6 }: { count?: number }) => (
  <View style={styles.listContent}>
    {Array.from({ length: count }, (_, index) => (
      <TransactionCardSkeleton key={`transaction-skeleton-${index}`} />
    ))}
  </View>
);

export const HistoryScreenSkeleton = () => (
  <View>
    <BalanceCardSkeleton />
    <View style={styles.filterSkeletonRow}>
      <Skeleton width={92} height={38} />
      <Skeleton width={110} height={38} />
      <Skeleton width={74} height={38} />
      <Skeleton width={48} height={38} />
    </View>
    <TransactionListSkeleton />
  </View>
);

export const DetailScreenSkeleton = () => (
  <View style={styles.detailSkeleton}>
    <DeviceCardSkeleton />
    <View style={styles.transactionDetailSkeleton}>
      <View style={styles.transactionDetailHeader}>
        <Skeleton width={42} height={42} />
        <View style={styles.transactionDetailHeading}>
          <Skeleton width={140} height={16} />
          <Skeleton width={76} height={12} style={styles.skeletonSpacing} />
        </View>
        <Skeleton width={62} height={26} />
      </View>
      <Skeleton width={112} height={12} style={styles.amountLabelSkeleton} />
      <Skeleton width="72%" height={32} style={styles.skeletonSpacing} />
      <View style={styles.detailDivider} />
      {Array.from({ length: 4 }, (_, index) => (
        <View key={`detail-row-${index}`} style={styles.detailRowSkeleton}>
          <Skeleton width="38%" height={13} />
          <Skeleton width="44%" height={13} />
        </View>
      ))}
      <Skeleton width={86} height={12} style={styles.referenceLabelSkeleton} />
      <Skeleton width="100%" height={52} style={styles.skeletonSpacing} />
    </View>
  </View>
);

export const DeviceDetailSkeleton = () => (
  <View style={styles.deviceDetailSkeleton}>
    <View style={styles.deviceDetailHeaderSkeleton}>
      <Skeleton width={36} height={36} />
      <Skeleton width={170} height={22} />
      <Skeleton width={36} height={36} />
    </View>

    <View style={styles.deviceDetailCardSkeleton}>
      <View style={styles.deviceDetailTopSkeleton}>
        <Skeleton width={72} height={72} />
        <View style={styles.deviceDetailInfoSkeleton}>
          <Skeleton width="72%" height={18} />
          <Skeleton width="48%" height={13} style={styles.skeletonSpacing} />
          <Skeleton width={70} height={24} style={styles.skeletonSpacing} />
        </View>
      </View>
      <View style={styles.detailDivider} />
      <Skeleton width="76%" height={14} />
      <Skeleton width="52%" height={14} style={styles.deviceDetailRowSpacing} />
    </View>

    <Skeleton width="auto" height={126} style={styles.balanceHeroSkeleton} />

    <View style={styles.deviceSummarySkeletonRow}>
      <Skeleton width="48%" height={92} />
      <Skeleton width="48%" height={92} />
    </View>

    <View style={styles.deviceFilterSkeletonRow}>
      <Skeleton width={76} height={36} />
      <Skeleton width={92} height={36} />
      <Skeleton width={96} height={36} />
      <Skeleton width={82} height={36} />
    </View>
    <Skeleton width="auto" height={245} style={styles.deviceChartSkeleton} />

    <Skeleton width={148} height={20} style={styles.activityTitleSkeleton} />
    <View style={styles.deviceActivitySkeletonList}>
      {Array.from({ length: 3 }, (_, index) => (
        <TransactionCardSkeleton key={`device-activity-${index}`} />
      ))}
    </View>
  </View>
);

export const BalanceScreenSkeleton = () => (
  <View>
    <BalanceCardSkeleton />
    <View style={styles.summarySkeleton}>
      <Skeleton width={140} height={140} style={styles.roundSkeleton} />
      <View style={styles.summaryLegendSkeleton}>
        <Skeleton width="100%" height={36} />
        <Skeleton width="100%" height={36} />
        <Skeleton width="100%" height={36} />
      </View>
    </View>
    <TransactionListSkeleton count={4} />
  </View>
);

const styles = StyleSheet.create({
  balanceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: RADIUS.card,
    padding: 24,
    marginHorizontal: 20,
  },

  transactionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: RADIUS.card,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  deviceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: RADIUS.card,
    padding: 16,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: 20,
  },
  filterSkeletonRow: {
    flexDirection: "row",
    gap: 10,
    marginVertical: 20,
    paddingHorizontal: 20,
    overflow: "hidden",
  },
  detailSkeleton: {
    paddingHorizontal: 20,
  },
  transactionDetailSkeleton: {
    padding: 20,
    borderRadius: RADIUS.card,
    backgroundColor: "#FFFFFF",
  },
  transactionDetailHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  transactionDetailHeading: {
    flex: 1,
    marginLeft: 12,
  },
  skeletonSpacing: {
    marginTop: 7,
  },
  amountLabelSkeleton: {
    marginTop: 24,
  },
  detailDivider: {
    height: 1,
    marginVertical: 20,
    backgroundColor: COLORS.border,
  },
  detailRowSkeleton: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  referenceLabelSkeleton: {
    marginTop: 14,
  },
  summarySkeleton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
    marginHorizontal: 20,
    marginTop: 18,
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderRadius: RADIUS.card,
    backgroundColor: "#FFFFFF",
  },
  roundSkeleton: {
    borderRadius: RADIUS.full,
  },
  summaryLegendSkeleton: {
    flex: 1,
    gap: 12,
  },
  deviceDetailSkeleton: {
    paddingBottom: 40,
  },
  deviceDetailHeaderSkeleton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginBottom: 16,
  },
  deviceDetailCardSkeleton: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: RADIUS.card,
    backgroundColor: "#FFFFFF",
  },
  deviceDetailTopSkeleton: {
    flexDirection: "row",
    alignItems: "center",
  },
  deviceDetailInfoSkeleton: {
    flex: 1,
    marginLeft: 16,
  },
  deviceDetailRowSpacing: {
    marginTop: 18,
  },
  balanceHeroSkeleton: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: RADIUS.card,
  },
  deviceSummarySkeletonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: 16,
  },
  deviceFilterSkeletonRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 24,
    paddingHorizontal: 20,
    overflow: "hidden",
  },
  deviceChartSkeleton: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: RADIUS.card,
  },
  activityTitleSkeleton: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  deviceActivitySkeletonList: {
    marginTop: 16,
    paddingHorizontal: 20,
  },
});
