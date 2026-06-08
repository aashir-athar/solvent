// Entry gate: first run goes to onboarding, returning users go straight to their date.

import { Redirect } from 'expo-router';
import { useSettingsStore } from '@/stores/useSettingsStore';

export default function Index() {
  const hasOnboarded = useSettingsStore((s) => s.hasOnboarded);
  return <Redirect href={hasOnboarded ? '/(tabs)' : '/onboarding'} />;
}
