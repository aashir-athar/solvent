// Themed slider wrapper for the what-if control. Thin layer over the community slider
// so screens stay clean and the accent stays consistent.

import Slider from '@react-native-community/slider';
import { useTheme } from '@/theme';

export interface AppSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  onSlidingComplete?: (value: number) => void;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  accessibilityLabel?: string;
}

export function AppSlider({
  value,
  onValueChange,
  onSlidingComplete,
  minimumValue = 0,
  maximumValue = 100,
  step = 1,
  accessibilityLabel,
}: AppSliderProps) {
  const theme = useTheme();
  return (
    <Slider
      value={value}
      onValueChange={onValueChange}
      onSlidingComplete={onSlidingComplete}
      minimumValue={minimumValue}
      maximumValue={maximumValue}
      step={step}
      minimumTrackTintColor={theme.color.accent.solid}
      maximumTrackTintColor={theme.color.border.default}
      thumbTintColor={theme.color.accent.solid}
      accessibilityLabel={accessibilityLabel}
      style={{ width: '100%', height: 40 }}
    />
  );
}
