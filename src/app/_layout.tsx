import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { COLORS } from "../theme";

const queryClient = new QueryClient();

const { width } = Dimensions.get("window");

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);

  const progressWidth = useSharedValue(0);
  const splashOpacity = useSharedValue(1);

  const [fontsLoaded, error] = useFonts({
    Inter_400Regular: require("../../assets/fonts/Inter-Regular.ttf"),
    Inter_500Medium: require("../../assets/fonts/Inter-Medium.ttf"),
    Inter_600SemiBold: require("../../assets/fonts/Inter-SemiBold.ttf"),
    Inter_700Bold: require("../../assets/fonts/Inter-Bold.ttf"),
  });

  useEffect(() => {
    if (!fontsLoaded && !error) {
      return;
    }

    progressWidth.value = withTiming(
      width * 0.7,
      {
        duration: 2200,
        easing: Easing.out(Easing.cubic),
      },
      (finished) => {
        if (finished) {
          splashOpacity.value = withTiming(
            0,
            {
              duration: 500,
            },
            () => {
              runOnJS(setShowSplash)(false);
            },
          );
        }
      },
    );
  }, [fontsLoaded, error]);

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: progressWidth.value,
  }));

  const animatedSplashStyle = useAnimatedStyle(() => ({
    opacity: splashOpacity.value,
  }));

  if (!fontsLoaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <QueryClientProvider client={queryClient}>
          <View style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />

              <Stack.Screen
                name="action-sheet-modal"
                options={{
                  presentation: "transparentModal",
                  animation: "fade",
                }}
              />
            </Stack>

            {showSplash && (
              <Animated.View
                style={[
                  styles.splashContainer,
                  animatedSplashStyle,
                ]}
              >
                <Image
                  source={require("../../assets/splash.png")}
                  resizeMode="contain"
                  style={styles.splashImage}
                />

                <View style={styles.loadingTrack}>
                  <Animated.View
                    style={[
                      styles.loadingFill,
                      animatedProgressStyle,
                    ]}
                  />
                </View>
              </Animated.View>
            )}
          </View>
        </QueryClientProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },

  splashImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },

  loadingTrack: {
    position: "absolute",
    bottom: 70,
    width: width * 0.7,
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
    overflow: "hidden",
  },

  loadingFill: {
    height: "100%",
    width: 0,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
  },
});
