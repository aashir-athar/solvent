// Header for stack and modal screens: a back chevron or close X, a title, optional
// right action. Tall, edge-aligned tap targets (Fitts's Law).

import { Pressable, View } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './Text';
import { ChevronLeftIcon, CloseIcon } from './icons';

export interface ScreenHeaderProps {
  title?: string;
  onBack?: () => void;
  onClose?: () => void;
  right?: React.ReactNode;
}

export function ScreenHeader({ title, onBack, onClose, right }: ScreenHeaderProps) {
  const theme = useTheme();
  const leading = onBack ?? onClose;
  const LeadingIcon = onBack ? ChevronLeftIcon : CloseIcon;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 48,
        gap: theme.space.xs,
        paddingTop: theme.space.sm,
      }}
    >
      {leading ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={onBack ? 'Back' : 'Close'}
          hitSlop={10}
          onPress={leading}
          style={{ width: 40, height: 44, alignItems: 'flex-start', justifyContent: 'center' }}
        >
          <LeadingIcon size={24} color={theme.color.text.primary} strokeWidth={2} />
        </Pressable>
      ) : null}
      <Text variant="subtitle" style={{ flex: 1 }} numberOfLines={1}>
        {title}
      </Text>
      {right}
    </View>
  );
}
