// A restrained content container. Default is a flat surface with a hairline border,
// not a heavy shadow card. Use only where grouping genuinely needs a boundary; prefer
// spacing and dividers elsewhere. Never nest a Card inside a Card.

import { View, type ViewProps } from 'react-native';
import { useTheme } from '@/theme';

export interface CardProps extends ViewProps {
  padded?: boolean;
  elevated?: boolean;
  accent?: boolean;
}

export function Card({ padded = true, elevated = false, accent = false, style, children, ...rest }: CardProps) {
  const theme = useTheme();
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: accent ? theme.color.accent.subtle : theme.color.bg.surface,
          borderRadius: theme.radii.xl,
          borderWidth: 1,
          borderColor: accent ? theme.color.accent.border : theme.color.border.subtle,
          padding: padded ? theme.space.lg : 0,
        },
        elevated ? theme.shadow('sm') : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}
