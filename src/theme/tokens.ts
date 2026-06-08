// The assembled Solvent theme: a thin semantic adapter over @mindees/tokens.
//
// Source of truth: @mindees/tokens supplies the gray + status colour scales, the 4pt
// spacing scale, radii, shadows, motion curves and touch targets. This file maps those
// primitives to Solvent's semantic intents and swaps in the one locked brand accent
// (spruce). Components read ONLY from here, never from raw scales or hex literals.

import type { ViewStyle, TextStyle } from 'react-native';
import {
  lightPalette,
  darkPalette,
  space,
  radii,
  minTouchTarget,
  shadows,
  resolveShadow,
  duration,
  easing,
} from '@mindees/tokens';
import { spruceLight, spruceDark, onSpruce } from './spruce';
import { fontFamily } from './fonts';

export type ColorScheme = 'light' | 'dark';

export interface AppColors {
  bg: {
    canvas: string;
    surface: string;
    subtle: string;
    elevated: string;
    inverse: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string; // large text / icons / meta only, not body, not placeholder
    inverse: string;
    onAccent: string;
    link: string;
  };
  border: {
    subtle: string;
    default: string;
    strong: string;
    focus: string;
  };
  accent: {
    solid: string;
    hover: string;
    active: string;
    text: string;
    subtle: string;
    border: string;
  };
  status: {
    success: string;
    successSubtle: string;
    danger: string;
    dangerSubtle: string;
    warning: string;
    warningSubtle: string;
  };
  overlay: {
    scrim: string;
    scrimStrong: string;
  };
}

const lightColors: AppColors = {
  bg: {
    canvas: lightPalette.gray[1], // #f8f8f8 off-white base
    surface: lightPalette.gray[0], // #fcfcfc cards lift subtly above canvas
    subtle: lightPalette.gray[2], // #f0f0f0 pressed / inset
    elevated: lightPalette.gray[0],
    inverse: lightPalette.gray[11],
  },
  text: {
    primary: lightPalette.gray[11], // #202020 (16.5:1)
    secondary: lightPalette.gray[10], // #646464 (5.4:1) body-capable
    muted: lightPalette.gray[8], // #8d8d8d large/meta only
    inverse: lightPalette.gray[0],
    onAccent: onSpruce,
    link: spruceLight[11],
  },
  border: {
    subtle: lightPalette.gray[3],
    default: lightPalette.gray[5],
    strong: lightPalette.gray[7],
    focus: spruceLight[8],
  },
  accent: {
    solid: spruceLight[9],
    hover: spruceLight[10],
    active: spruceLight[10],
    text: spruceLight[11],
    subtle: spruceLight[2],
    border: spruceLight[6],
  },
  status: {
    success: spruceLight[9],
    successSubtle: spruceLight[2],
    danger: lightPalette.red[11],
    dangerSubtle: lightPalette.red[2],
    warning: lightPalette.orange[11],
    warningSubtle: lightPalette.orange[2],
  },
  overlay: {
    scrim: 'rgba(18,18,18,0.45)',
    scrimStrong: 'rgba(18,18,18,0.70)',
  },
};

const darkColors: AppColors = {
  bg: {
    canvas: darkPalette.gray[0], // #111111 off-black base
    surface: darkPalette.gray[1], // #191919 lighter = higher elevation
    subtle: darkPalette.gray[2], // #222222
    elevated: darkPalette.gray[2],
    inverse: darkPalette.gray[11],
  },
  text: {
    primary: darkPalette.gray[11], // #eeeeee
    secondary: darkPalette.gray[10], // #b4b4b4 (8.6:1)
    muted: darkPalette.gray[9], // #7b7b7b large/meta only
    inverse: darkPalette.gray[0],
    onAccent: onSpruce,
    link: spruceDark[11],
  },
  border: {
    subtle: darkPalette.gray[3],
    default: darkPalette.gray[5],
    strong: darkPalette.gray[7],
    focus: spruceDark[9],
  },
  accent: {
    solid: spruceDark[9],
    hover: spruceDark[10],
    active: spruceDark[10],
    text: spruceDark[11],
    subtle: spruceDark[2],
    border: spruceDark[7],
  },
  status: {
    success: spruceDark[9],
    successSubtle: spruceDark[2],
    danger: darkPalette.red[10],
    dangerSubtle: darkPalette.red[2],
    warning: darkPalette.orange[10],
    warningSubtle: darkPalette.orange[2],
  },
  overlay: {
    scrim: 'rgba(0,0,0,0.50)',
    scrimStrong: 'rgba(0,0,0,0.72)',
  },
};

export interface TextVariant {
  fontSize: number;
  lineHeight: number;
  fontFamily: string;
  letterSpacing: number;
}

// Type scale built on ui-ux-2026 numbers: warm display (Sora) for feeling, Inter for
// reading, JetBrains Mono for every figure. Body 16 / line-height 24, measure handled
// at the component level.
export const textVariants = {
  hero: { fontSize: 56, lineHeight: 60, fontFamily: fontFamily.display, letterSpacing: -1.4 },
  display: { fontSize: 40, lineHeight: 44, fontFamily: fontFamily.display, letterSpacing: -1.0 },
  h1: { fontSize: 32, lineHeight: 38, fontFamily: fontFamily.display, letterSpacing: -0.6 },
  h2: { fontSize: 24, lineHeight: 30, fontFamily: fontFamily.displaySemibold, letterSpacing: -0.4 },
  title: { fontSize: 20, lineHeight: 26, fontFamily: fontFamily.displaySemibold, letterSpacing: -0.2 },
  subtitle: { fontSize: 17, lineHeight: 24, fontFamily: fontFamily.bodySemibold, letterSpacing: -0.1 },
  body: { fontSize: 16, lineHeight: 24, fontFamily: fontFamily.body, letterSpacing: 0 },
  bodyMedium: { fontSize: 16, lineHeight: 24, fontFamily: fontFamily.bodyMedium, letterSpacing: 0 },
  bodySm: { fontSize: 14, lineHeight: 20, fontFamily: fontFamily.body, letterSpacing: 0 },
  label: { fontSize: 13, lineHeight: 16, fontFamily: fontFamily.bodyMedium, letterSpacing: 0.2 },
  overline: { fontSize: 12, lineHeight: 16, fontFamily: fontFamily.bodySemibold, letterSpacing: 1.2 },
  caption: { fontSize: 12, lineHeight: 16, fontFamily: fontFamily.body, letterSpacing: 0.1 },
  mono: { fontSize: 15, lineHeight: 22, fontFamily: fontFamily.mono, letterSpacing: 0 },
  monoMedium: { fontSize: 15, lineHeight: 22, fontFamily: fontFamily.monoMedium, letterSpacing: 0 },
  monoLg: { fontSize: 18, lineHeight: 24, fontFamily: fontFamily.monoMedium, letterSpacing: 0 },
  monoSm: { fontSize: 13, lineHeight: 18, fontFamily: fontFamily.mono, letterSpacing: 0 },
  monoBold: { fontSize: 16, lineHeight: 22, fontFamily: fontFamily.monoBold, letterSpacing: 0 },
} as const satisfies Record<string, TextVariant>;

export type TextVariantName = keyof typeof textVariants;

export interface Theme {
  scheme: ColorScheme;
  color: AppColors;
  space: typeof space;
  radii: typeof radii;
  touch: typeof minTouchTarget;
  shadows: typeof shadows;
  shadow: (token: keyof typeof shadows) => ViewStyle;
  duration: typeof duration;
  easing: typeof easing;
  text: Record<TextVariantName, TextVariant>;
}

export function buildTheme(scheme: ColorScheme): Theme {
  return {
    scheme,
    color: scheme === 'dark' ? darkColors : lightColors,
    space,
    radii,
    touch: minTouchTarget,
    shadows,
    shadow: resolveShadow,
    duration,
    easing,
    text: textVariants,
  };
}

/** Convert a motion easing tuple from tokens into a Reanimated/Easing-friendly bezier array. */
export function bezier(token: keyof typeof easing): readonly [number, number, number, number] {
  return easing[token] as readonly [number, number, number, number];
}

export type { TextStyle };
