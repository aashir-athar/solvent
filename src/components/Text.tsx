// Typed text primitive. Every string in the app renders through this so the type
// scale and colour tokens are the single source of truth. No raw fontSize/color.
// Variants: hero | display | h1 | h2 | title | subtitle | body | bodyMedium |
// bodySm | label | overline | caption | mono | monoMedium | monoLg | monoSm | monoBold

import { Text as RNText, type TextProps as RNTextProps, type StyleProp, type TextStyle } from 'react-native';
import { useTheme, type Theme, type TextVariantName } from '@/theme';

export type TextColor =
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'inverse'
  | 'onAccent'
  | 'accent'
  | 'danger'
  | 'success'
  | 'warning'
  | 'link';

export interface AppTextProps extends RNTextProps {
  variant?: TextVariantName;
  color?: TextColor;
  align?: TextStyle['textAlign'];
  style?: StyleProp<TextStyle>;
}

function resolveColor(theme: Theme, color: TextColor): string {
  switch (color) {
    case 'primary':
      return theme.color.text.primary;
    case 'secondary':
      return theme.color.text.secondary;
    case 'muted':
      return theme.color.text.muted;
    case 'inverse':
      return theme.color.text.inverse;
    case 'onAccent':
      return theme.color.text.onAccent;
    case 'accent':
      return theme.color.accent.text;
    case 'danger':
      return theme.color.status.danger;
    case 'success':
      return theme.color.status.success;
    case 'warning':
      return theme.color.status.warning;
    case 'link':
      return theme.color.text.link;
  }
}

export function Text({ variant = 'body', color = 'primary', align, style, ...rest }: AppTextProps) {
  const theme = useTheme();
  const v = theme.text[variant];
  return (
    <RNText
      {...rest}
      style={[
        {
          fontFamily: v.fontFamily,
          fontSize: v.fontSize,
          lineHeight: v.lineHeight,
          letterSpacing: v.letterSpacing,
          color: resolveColor(theme, color),
        },
        align ? { textAlign: align } : null,
        style,
      ]}
    />
  );
}
