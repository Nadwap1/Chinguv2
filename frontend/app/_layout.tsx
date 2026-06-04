import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { useIconFonts } from "@/src/hooks/use-icon-fonts";
import { api } from "@/src/api/client";

SplashScreen.preventAutoHideAsync();

// Keep-alive interval: 4 minutes. Combined with an external uptime monitor
// hitting /api/ping, this prevents Emergent / Render-style platforms from
// idling the backend container.
const KEEPALIVE_INTERVAL_MS = 4 * 60 * 1000;

export default function RootLayout() {
  const [loaded, error] = useIconFonts();

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  // Background keep-alive while app is in foreground.
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    let mounted = true;

    const pingNow = () => {
      api.ping().catch(() => {
        /* silently ignore network errors */
      });
    };

    const startTimer = () => {
      if (timer) return;
      pingNow();
      timer = setInterval(pingNow, KEEPALIVE_INTERVAL_MS);
    };
    const stopTimer = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    // Always start ticking
    startTimer();

    // Pause on background (mobile only — web has no AppState change)
    const handle = (state: AppStateStatus) => {
      if (!mounted) return;
      if (state === "active") startTimer();
      else stopTimer();
    };
    const sub = Platform.OS !== "web" ? AppState.addEventListener("change", handle) : null;

    return () => {
      mounted = false;
      stopTimer();
      sub?.remove?.();
    };
  }, []);

  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#0A0514" } }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="voice" />
            <Stack.Screen name="translate" />
            <Stack.Screen name="camera" options={{ presentation: "modal" }} />
            <Stack.Screen name="chat" />
            <Stack.Screen name="language-picker" options={{ presentation: "modal" }} />
            <Stack.Screen name="settings" />
            <Stack.Screen name="paywall" options={{ presentation: "modal" }} />
            <Stack.Screen name="admin-login" />
            <Stack.Screen name="admin" />
            <Stack.Screen name="auth" options={{ presentation: "modal" }} />
            <Stack.Screen name="translate-screen" />
            <Stack.Screen name="voice-screen" />
            <Stack.Screen name="saved-screen" />
            <Stack.Screen name="profile-screen" />
          </Stack>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
