// Money input. Presents a currency symbol and a decimal keypad, and emits integer
// minor units so the value handed to the engine is never a float string.

import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { toMinor, toMajor } from '@/core';
import { useTheme } from '@/theme';
import { Text } from './Text';

export interface MoneyFieldProps {
  label: string;
  value: number | undefined;
  onChangeMinor: (minor: number | undefined) => void;
  currencySymbol?: string;
  helper?: string;
  error?: string;
  placeholder?: string;
}

function sanitize(input: string): string {
  const cleaned = input.replace(/[^0-9.]/g, '');
  const firstDot = cleaned.indexOf('.');
  if (firstDot === -1) return cleaned;
  return cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '');
}

export function MoneyField({
  label,
  value,
  onChangeMinor,
  currencySymbol = '$',
  helper,
  error,
  placeholder = '0.00',
}: MoneyFieldProps) {
  const theme = useTheme();
  const [text, setText] = useState(value !== undefined ? String(toMajor(value)) : '');
  const [focused, setFocused] = useState(false);

  const handleChange = (raw: string) => {
    const next = sanitize(raw);
    setText(next);
    if (next === '' || next === '.') {
      onChangeMinor(undefined);
      return;
    }
    const major = Number.parseFloat(next);
    onChangeMinor(Number.isFinite(major) ? toMinor(major) : undefined);
  };

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
        <Text variant="monoMedium" color="secondary">
          {currencySymbol}
        </Text>
        <TextInput
          value={text}
          onChangeText={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          keyboardType="decimal-pad"
          inputMode="decimal"
          placeholder={placeholder}
          placeholderTextColor={theme.color.text.secondary}
          accessibilityLabel={label}
          style={{
            flex: 1,
            paddingVertical: theme.space.sm,
            color: theme.color.text.primary,
            fontFamily: theme.text.monoMedium.fontFamily,
            fontSize: theme.text.monoLg.fontSize,
          }}
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
}
