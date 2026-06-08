// Hairline divider. The primary way to separate rows and group content, used instead
// of boxing everything in cards (per the minimalist lane).

import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme';

export interface DividerProps {
  inset?: number;
  strong?: boolean;
}

export function Divider({ inset = 0, strong = false }: DividerProps) {
  const theme = useTheme();
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        height: StyleSheet.hairlineWidth,
        marginLeft: inset,
        backgroundColor: strong ? theme.color.border.default : theme.color.border.subtle,
      }}
    />
  );
}
