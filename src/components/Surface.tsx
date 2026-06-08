// Platform-aware translucent surface. The ONE place glass/blur/flat is decided:
//   iOS >= 26  -> Liquid Glass (expo-glass-effect)
//   iOS < 26   -> BlurView (expo-blur)
//   Android    -> flat tonal surface + subtle elevation (never blur, never glass)
// Screens never call GlassView/BlurView directly; they go through here.
// Variants: flat | elevated | glass

import { Platform, View, type ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { useTheme } from '@/theme';

export type SurfaceVariant = 'flat' | 'elevated' | 'glass';

export interface SurfaceProps extends ViewProps {
  variant?: SurfaceVariant;
  radius?: number;
  intensity?: number;
}

export function Surface({ variant = 'flat', radius, intensity = 40, style, children, ...rest }: SurfaceProps) {
  const theme = useTheme();
  const borderRadius = radius ?? theme.radii.xl;

  if (variant !== 'glass') {
    return (
      <View
        {...rest}
        style={[
          {
            backgroundColor: theme.color.bg.surface,
            borderRadius,
          },
          variant === 'elevated' ? theme.shadow('md') : null,
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  if (Platform.OS === 'android') {
    return (
      <View
        {...rest}
        style={[
          {
            backgroundColor: theme.color.bg.elevated,
            borderRadius,
            borderWidth: 1,
            borderColor: theme.color.border.subtle,
          },
          theme.shadow('sm'),
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  if (Platform.OS === 'ios' && isLiquidGlassAvailable()) {
    return (
      <GlassView {...rest} style={[{ borderRadius, overflow: 'hidden' }, style]}>
        {children}
      </GlassView>
    );
  }

  return (
    <BlurView
      {...rest}
      intensity={intensity}
      tint={theme.scheme === 'dark' ? 'dark' : 'light'}
      style={[{ borderRadius, overflow: 'hidden' }, style]}
    >
      {children}
    </BlurView>
  );
}
