import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const queryClient = new QueryClient();

export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
    Inter_400Regular: require("../../assets/fonts/Inter-Regular.ttf"),
    Inter_500Medium: require("../../assets/fonts/Inter-Medium.ttf"),
    Inter_600SemiBold: require("../../assets/fonts/Inter-SemiBold.ttf"),
    Inter_700Bold: require("../../assets/fonts/Inter-Bold.ttf"),
  });

  if (!fontsLoaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <QueryClientProvider client={queryClient}>
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
        </QueryClientProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
