// Segmented control for local switching (payoff strategy, theme tri-state). The
// selected highlight slides on the UI thread with a custom ease; reduced motion snaps.

import { useState } from 'react';
import { LayoutChangeEvent, Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/theme';
import { haptics } from '@/lib/haptics';
import { Text } from './Text';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  options: ReadonlyArray<SegmentOption<T>>;
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: SegmentedControlProps<T>) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const [width, setWidth] = useState(0);
  const translate = useSharedValue(0);

  const count = options.length;
  const segmentWidth = width > 0 ? (width - 8) / count : 0;
  const selectedIndex = Math.max(0, options.findIndex((o) => o.value === value));

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setWidth(w);
    translate.value = (selectedIndex * (w - 8)) / count;
  };

  const moveTo = (index: number) => {
    const target = index * segmentWidth;
    translate.value = reduced
      ? target
      : withTiming(target, { duration: 220, easing: Easing.bezier(0.2, 0, 0, 1) });
  };

  const highlightStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translate.value }] }));

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      onLayout={onLayout}
      style={{
        flexDirection: 'row',
        backgroundColor: theme.color.bg.subtle,
        borderRadius: theme.radii.lg,
        padding: 4,
        height: 44,
      }}
    >
      {segmentWidth > 0 ? (
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 4,
              left: 4,
              height: 36,
              width: segmentWidth,
              borderRadius: theme.radii.md,
              backgroundColor: theme.color.bg.surface,
            },
            theme.shadow('xs'),
            highlightStyle,
          ]}
        />
      ) : null}

      {options.map((option, index) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={option.label}
            onPress={() => {
              if (option.value === value) return;
              haptics.selection();
              moveTo(index);
              onChange(option.value);
            }}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text variant="label" color={active ? 'primary' : 'secondary'}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
