// Thin haptics wrapper. Subtle feedback on key actions only, never gratuitous.
// Every call is fire-and-forget and swallows errors on devices without haptics.

import * as Haptics from 'expo-haptics';

const swallow = () => {};

export const haptics = {
  light: () => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(swallow),
  medium: () => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(swallow),
  heavy: () => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(swallow),
  selection: () => void Haptics.selectionAsync().catch(swallow),
  success: () => void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(swallow),
  warning: () => void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(swallow),
  error: () => void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(swallow),
};
