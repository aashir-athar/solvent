// Root layout: load fonts, hold the native splash until fonts + persisted state are
// ready (no spinner, ever), then mount the theme, gesture, and safe-area providers and
// the navigation stack. Debts load from SQLite on start so the home date is ready.

// Must be first: polyfills crypto.getRandomValues for on-device backup encryption.
import 'react-native-get-random-values';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { fontAssets, ThemeProvider } from '@/theme';
import { useI18nStore } from '@/i18n';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useDebtsStore } from '@/stores/useDebtsStore';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const hydrated = useSettingsStore((s) => s.hydrated);
  const langHydrated = useI18nStore((s) => s.hydrated);
  const loadDebts = useDebtsStore((s) => s.load);

  useEffect(() => {
    void loadDebts();
  }, [loadDebts]);

  const ready = (fontsLoaded || Boolean(fontError)) && hydrated && langHydrated;

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="plan" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="settings" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="why" options={{ presentation: 'modal' }} />
            <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
            <Stack.Screen name="backup" options={{ presentation: 'modal' }} />
            <Stack.Screen name="scan" options={{ presentation: 'modal' }} />
            <Stack.Screen name="debt/new" options={{ presentation: 'modal' }} />
            <Stack.Screen name="debt/[id]" options={{ presentation: 'modal' }} />
          </Stack>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
