// Local weekly nudge. Scheduled entirely on-device (expo-notifications), so it sends no
// data anywhere. Opt-in from Settings. The text is calm and honest, with no fake urgency.

import * as Notifications from 'expo-notifications';

const WEEKLY_ID = 'solvent-weekly-nudge';

export async function ensureNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function scheduleWeeklyNudge(): Promise<boolean> {
  const granted = await ensureNotificationPermission();
  if (!granted) return false;
  await cancelWeeklyNudge();
  await Notifications.scheduleNotificationAsync({
    identifier: WEEKLY_ID,
    content: {
      title: 'Your date is waiting',
      body: 'Open Solvent and see if you can pull it a little closer this week.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: 2,
      hour: 9,
      minute: 0,
    },
  });
  return true;
}

export async function cancelWeeklyNudge(): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(WEEKLY_ID);
  } catch {
    // No scheduled nudge to cancel; nothing to do.
  }
}
