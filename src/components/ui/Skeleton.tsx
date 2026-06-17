import { useEffect } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { COLORS } from '../../theme';

export const Skeleton = ({ width, height, style }: any) => {
  const opacity = useSharedValue(0.3);
  useEffect(() => { opacity.value = withRepeat(withTiming(0.7, { duration: 800 }), -1, true); }, []);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[animatedStyle, { width, height, backgroundColor: COLORS.border, borderRadius: 8, marginVertical: 4 }, style]} />;
};