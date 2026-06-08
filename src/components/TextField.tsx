// Text field: label above, input, helper or error below (proximity grouping).
// Focus ring uses the accent; error state takes the danger colour and announces itself.

import { forwardRef, useState } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './Text';

export interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  helper?: string;
  error?: string;
  leadingText?: string;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, helper, error, leadingText, onFocus, onBlur, ...rest },
  ref,
) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? theme.color.status.danger
    : focused
      ? theme.color.border.focus
      : theme.color.border.default;

  return (
    <View style={{ gap: theme.space.xs }}>
      <Text variant="label" color="secondary">
        {label}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          minHeight: 52,
          paddingHorizontal: theme.space.md,
          borderRadius: theme.radii.lg,
          borderWidth: 1.5,
          borderColor,
          backgroundColor: theme.color.bg.surface,
          gap: theme.space.xs,
        }}
      >
        {leadingText ? (
          <Text variant="monoMedium" color="secondary">
            {leadingText}
          </Text>
        ) : null}
        <TextInput
          ref={ref}
          {...rest}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          placeholderTextColor={theme.color.text.secondary}
          style={{
            flex: 1,
            paddingVertical: theme.space.sm,
            color: theme.color.text.primary,
            fontFamily: theme.text.body.fontFamily,
            fontSize: theme.text.body.fontSize,
          }}
          accessibilityLabel={label}
        />
      </View>
      {error ? (
        <Text variant="caption" color="danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : helper ? (
        <Text variant="caption" color="secondary">
          {helper}
        </Text>
      ) : null}
    </View>
  );
});
