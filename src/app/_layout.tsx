import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { COLORS } from "../theme";

// Tahan splash screen bawaan OS agar tidak langsung hilang
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();
const { width } = Dimensions.get("window");

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);
  const [animationDone, setAnimationDone] = useState(false);

  // Animasi untuk Progress Bar dan Efek Fade Out
  const progressWidth = useSharedValue(0);
  const splashOpacity = useSharedValue(1);

  const [fontsLoaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || error) {
      // 1. Sembunyikan splash screen bawaan OS (Serah terima ke Custom Splash)
      SplashScreen.hideAsync();
      setAppReady(true);

      // 2. Jalankan animasi Loading Bar (berjalan selama 1.5 detik)
      progressWidth.value = withTiming(
        width * 0.6,
        {
          duration: 2000,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Efek melambat di akhir
        },
        (isFinished) => {
          if (isFinished) {
            // 3. Setelah loading penuh, pudarkan layar Custom Splash
            splashOpacity.value = withTiming(0, { duration: 600 }, () => {
              runOnJS(setAnimationDone)(true);
            });
          }
        },
      );
    }
  }, [fontsLoaded, error]);

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: progressWidth.value,
  }));

  const animatedSplashStyle = useAnimatedStyle(() => ({
    opacity: splashOpacity.value,
  }));

  if (!fontsLoaded && !error) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <QueryClientProvider client={queryClient}>
          <View style={{ flex: 1 }}>
            {/* Aplikasi Utama */}
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

            {/* Custom Splash Screen Overlay */}
            {!animationDone && appReady && (
              <Animated.View
                style={[styles.splashContainer, animatedSplashStyle]}
              >
                {/* Pastikan logo splash.png Anda ada di folder assets */}
                <Image
                  source={require("../../assets/splash.png")}
                  style={styles.splashImage}
                  resizeMode="contain"
                />

                {/* Komponen Bar Loading */}
                <View style={styles.loadingTrack}>
                  <Animated.View
                    style={[styles.loadingFill, animatedProgressStyle]}
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
    backgroundColor: "#fbfbfb", // Latar belakang harus persis sama dengan di app.json
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999, // Pastikan menutupi seluruh aplikasi
  },
  splashImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  loadingTrack: {
    position: "absolute",
    bottom: 160, // Jarak dari bawah layar
    width: width * 0.6, // Lebar trek maksimal 60% dari layar
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.3)", // Warna trek redup
    borderRadius: 10,
    overflow: "hidden",
  },
  loadingFill: {
    height: "100%",
    backgroundColor: COLORS.primary, // Warna garis loading (Putih)
    borderRadius: 10,
  },
});
