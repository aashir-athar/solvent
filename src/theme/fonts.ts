// Font system. Three families on a contrast axis:
//   - Sora (display)      carries the emotional hero: the date you are free.
//   - Inter (body/UI)     the legibility workhorse for everything you read.
//   - JetBrains Mono      every audited figure: amounts, APR, the payoff schedule.
//
// The split is the design thesis made literal: a warm display face for FEELING,
// a precise monospace for PROOF.

import {
  Sora_600SemiBold,
  Sora_700Bold,
} from '@expo-google-fonts/sora';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  JetBrainsMono_700Bold,
} from '@expo-google-fonts/jetbrains-mono';

/** Passed to expo-font's useFonts. Keys become the fontFamily names. */
export const fontAssets = {
  Sora_600SemiBold,
  Sora_700Bold,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  JetBrainsMono_700Bold,
} as const;

export const fontFamily = {
  display: 'Sora_700Bold',
  displaySemibold: 'Sora_600SemiBold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemibold: 'Inter_600SemiBold',
  mono: 'JetBrainsMono_400Regular',
  monoMedium: 'JetBrainsMono_500Medium',
  monoBold: 'JetBrainsMono_700Bold',
} as const;

export type FontFamilyToken = keyof typeof fontFamily;
