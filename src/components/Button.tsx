// Primary action primitive. Press feedback is scale(0.97) on the UI thread (Emil's
// law: 120ms, transform only, honors reduced motion). Loading shows a skeleton bar,
// never a spinner. Variants: primary | secondary | ghost | danger. Sizes: md | sm.

import { useCallback } from 'react';
import { Pressable, View, type PressableProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/theme';
import { haptics } from '@/lib/haptics';
import { Text } from './Text';
import { Skeleton } from './Skeleton';
import type { IconProps } from './icons';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'md' | 'sm';

export interface ButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  hapticOnPress?: boolean;
  Icon?: React.ComponentType<IconProps>;
  iconPosition?: 'leading' | 'trailing';
}

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = true,
  hapticOnPress = true,
  Icon,
  iconPosition = 'leading',
  disabled,
  onPress,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);

  const isDisabled = disabled || loading;
  const height = size === 'md' ? 52 : 40;
  const paddingHorizontal = size === 'md' ? theme.space.xl : theme.space.md;

  const bg = {
    primary: theme.color.accent.solid,
    secondary: theme.color.bg.subtle,
    ghost: 'transparent',
    danger: theme.color.status.danger,
  }[variant];

  const fg: Parameters<typeof Text>[0]['color'] = {
    primary: 'onAccent',
    secondary: 'primary',
    ghost: 'accent',
    danger: 'onAccent',
  }[variant] as Parameters<typeof Text>[0]['color'];

  const iconColor = {
    primary: theme.color.text.onAccent,
    secondary: theme.color.text.primary,
    ghost: theme.color.accent.text,
    danger: theme.color.text.onAccent,
  }[variant];

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePressIn = useCallback(() => {
    if (!reduced) scale.value = withTiming(0.97, { duration: 120 });
  }, [reduced, scale]);

  const handlePressOut = useCallback(() => {
    if (!reduced) scale.value = withTiming(1, { duration: 120 });
  }, [reduced, scale]);

  const handlePress = useCallback<NonNullable<PressableProps['onPress']>>(
    (e) => {
      if (hapticOnPress) haptics.light();
      onPress?.(e);
    },
    [hapticOnPress, onPress],
  );

  return (
    <AnimatedPressable
      {...rest}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      hitSlop={8}
      style={[
        {
          height,
          paddingHorizontal,
          borderRadius: theme.radii.lg,
          backgroundColor: bg,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          gap: theme.space.xs,
          opacity: isDisabled && !loading ? 0.5 : 1,
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderColor: theme.color.border.default,
        },
        animatedStyle,
      ]}
    >
      {loading ? (
        <Skeleton width={96} height={14} radius={theme.radii.sm} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.xs }}>
          {Icon && iconPosition === 'leading' ? <Icon size={18} color={iconColor} strokeWidth={2} /> : null}
          <Text variant={size === 'md' ? 'subtitle' : 'label'} color={fg}>
            {label}
          </Text>
          {Icon && iconPosition === 'trailing' ? <Icon size={18} color={iconColor} strokeWidth={2} /> : null}
        </View>
      )}
    </AnimatedPressable>
  );
}
