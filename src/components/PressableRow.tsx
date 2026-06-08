// The list / navigation row. Tall enough for Fitts's Law, full-width tap target,
// hairline-separated rather than boxed. Optional leading icon, right-aligned value or
// trailing node, and a chevron for drill-down rows.

import { Pressable, View } from 'react-native';
import { useTheme } from '@/theme';
import { haptics } from '@/lib/haptics';
import { Text } from './Text';
import { ChevronRightIcon, type IconProps } from './icons';

export interface PressableRowProps {
  title: string;
  subtitle?: string;
  value?: string;
  Icon?: React.ComponentType<IconProps>;
  trailing?: React.ReactNode;
  showChevron?: boolean;
  danger?: boolean;
  onPress?: () => void;
  accessibilityHint?: string;
}

export function PressableRow({
  title,
  subtitle,
  value,
  Icon,
  trailing,
  showChevron = false,
  danger = false,
  onPress,
  accessibilityHint,
}: PressableRowProps) {
  const theme = useTheme();
  const titleColor = danger ? 'danger' : 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      onPress={() => {
        if (onPress) {
          haptics.selection();
          onPress();
        }
      }}
      disabled={!onPress}
      style={({ pressed }) => ({
        width: '100%',
        minHeight: 56,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.space.md,
        paddingVertical: theme.space.sm,
        backgroundColor: pressed && onPress ? theme.color.bg.subtle : 'transparent',
      })}
    >
      {Icon ? (
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: theme.radii.md,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.color.bg.subtle,
          }}
        >
          <Icon size={20} color={danger ? theme.color.status.danger : theme.color.text.primary} strokeWidth={2} />
        </View>
      ) : null}

      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="bodyMedium" color={titleColor}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="bodySm" color="secondary">
            {subtitle}
          </Text>
        ) : null}
      </View>

      {value ? (
        <Text variant="monoMedium" color="secondary">
          {value}
        </Text>
      ) : null}
      {trailing}
      {showChevron ? <ChevronRightIcon size={20} color={theme.color.text.muted} strokeWidth={2} /> : null}
    </Pressable>
  );
}
