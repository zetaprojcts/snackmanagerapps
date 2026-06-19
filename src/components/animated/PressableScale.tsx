import React, { ReactNode } from "react";

import { Pressable, PressableProps } from "react-native";

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type Props = PressableProps & {
  children: ReactNode;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function PressableScale({
  children,
  onPressIn,
  onPressOut,
  style,
  ...props
}: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: scale.value,
        },
      ],
    };
  });

  return (
    <AnimatedPressable
      {...props}
      style={[style, animatedStyle]}
      onPressIn={(event) => {
        scale.value = withTiming(0.97, {
          duration: 100,
        });

        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.value = withTiming(1, {
          duration: 100,
        });

        onPressOut?.(event);
      }}
    >
      {children}
    </AnimatedPressable>
  );
}
