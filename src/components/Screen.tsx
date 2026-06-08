// Screen scaffold: safe-area aware, themed canvas background, correct status-bar
// content colour, optional scroll and keyboard avoidance. Every screen wraps in this
// so safe areas and the keyboard are handled once, correctly, on both platforms.

import { KeyboardAvoidingView, Platform, ScrollView, View, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/theme';

export interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  keyboardAware?: boolean;
  padded?: boolean;
  edges?: readonly Edge[];
  contentContainerStyle?: ViewStyle;
  style?: ViewStyle;
}

export function Screen({
  children,
  scroll = false,
  keyboardAware = false,
  padded = true,
  edges = ['top'],
  contentContainerStyle,
  style,
}: ScreenProps) {
  const theme = useTheme();
  const pad = padded ? { paddingHorizontal: theme.space.lg } : null;

  const body = scroll ? (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[{ paddingBottom: theme.space['5xl'] }, pad, contentContainerStyle]}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1 }, pad, contentContainerStyle]}>{children}</View>
  );

  const content = keyboardAware ? (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {body}
    </KeyboardAvoidingView>
  ) : (
    body
  );

  return (
    <SafeAreaView edges={edges} style={[{ flex: 1, backgroundColor: theme.color.bg.canvas }, style]}>
      <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />
      {content}
    </SafeAreaView>
  );
}
