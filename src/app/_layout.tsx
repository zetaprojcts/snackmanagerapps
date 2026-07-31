import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import {
  AuthProvider,
  useAuth,
} from "../features/auth/AuthProvider";
import { COLORS } from "../theme";

const queryClient = new QueryClient();

function AppNavigator() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="login" />
      </Stack.Protected>

      <Stack.Protected guard={Boolean(session)}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="device-detail" />
        <Stack.Screen name="edit-device" />
        <Stack.Screen name="income-detail" />
        <Stack.Screen name="payment-detail" />

        <Stack.Screen
          name="action-sheet-modal"
          options={{
            presentation: "transparentModal",
            animation: "fade",
          }}
        />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular: require(
      "../../assets/fonts/Inter-Regular.ttf"
    ),
    Inter_500Medium: require(
      "../../assets/fonts/Inter-Medium.ttf"
    ),
    Inter_600SemiBold: require(
      "../../assets/fonts/Inter-SemiBold.ttf"
    ),
    Inter_700Bold: require(
      "../../assets/fonts/Inter-Bold.ttf"
    ),
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <BottomSheetModalProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <StatusBar style="dark" />
            <AppNavigator />
          </AuthProvider>
        </QueryClientProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
});