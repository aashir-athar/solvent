// Empty state: a calm prompt, not a dead end. One icon, an encouraging line, and a
// single clear action. Copy speaks to the moment, never generic filler.

import { View } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './Text';
import { Button } from './Button';
import type { IconProps } from './icons';

export interface EmptyStateProps {
  Icon: React.ComponentType<IconProps>;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ Icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  const theme = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: theme.space['4xl'], gap: theme.space.md }}>
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: theme.radii['2xl'],
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.color.accent.subtle,
        }}
      >
        <Icon size={28} color={theme.color.accent.text} strokeWidth={2} />
      </View>
      <View style={{ gap: theme.space.xs, alignItems: 'center' }}>
        <Text variant="title" align="center">
          {title}
        </Text>
        <Text variant="body" color="secondary" align="center" style={{ maxWidth: 300 }}>
          {message}
        </Text>
      </View>
      {actionLabel && onAction ? (
        <View style={{ marginTop: theme.space.sm }}>
          <Button label={actionLabel} onPress={onAction} fullWidth={false} />
        </View>
      ) : null}
    </View>
  );
}
