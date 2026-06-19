import React, { ReactNode, useEffect } from "react";

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type Props = {
  children: ReactNode;
  delay?: number;
};

export default function FadeInView({ children, delay = 0 }: Props) {
  const opacity = useSharedValue(0);

  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: 350,
    });

    translateY.value = withTiming(0, {
      duration: 350,
    });
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        {
          translateY: translateY.value,
        },
      ],
    };
  });

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}
