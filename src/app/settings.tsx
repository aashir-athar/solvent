// Settings (stack). Language, appearance, the day your date lands on, currency,
// reminders, Pro, and about.

import { Pressable, Switch, View } from 'react-native';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import {
  CheckIcon,
  Divider,
  MinusIcon,
  PlusIcon,
  PressableRow,
  Screen,
  ScreenHeader,
  SegmentedControl,
  Text,
} from '@/components';
import { useTheme, useThemeController, type ThemePreference } from '@/theme';
import { LANGUAGES, useI18nStore, useTranslation, type Language } from '@/i18n';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useEntitlement } from '@/features/paywall/entitlement';
import { haptics } from '@/lib/haptics';
import { cancelWeeklyNudge, scheduleWeeklyNudge } from '@/lib/notifications';

const CURRENCIES: ReadonlyArray<{ code: string; name: string }> = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'PKR', name: 'Pakistani Rupee' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'NGN', name: 'Nigerian Naira' },
  { code: 'BRL', name: 'Brazilian Real' },
  { code: 'IDR', name: 'Indonesian Rupiah' },
];

export default function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { preference, setPreference } = useThemeController();
  const language = useI18nStore((s) => s.language);
  const setLanguage = useI18nStore((s) => s.setLanguage);
  const currency = useSettingsStore((s) => s.currency);
  const setCurrency = useSettingsStore((s) => s.setCurrency);
  const paymentDay = useSettingsStore((s) => s.paymentDay);
  const setPaymentDay = useSettingsStore((s) => s.setPaymentDay);
  const nudgeEnabled = useSettingsStore((s) => s.nudgeEnabled);
  const setNudgeEnabled = useSettingsStore((s) => s.setNudgeEnabled);
  const { isPro } = useEntitlement();

  const themeOptions: ReadonlyArray<{ value: ThemePreference; label: string }> = [
    { value: 'system', label: t('settings.themeSystem') },
    { value: 'light', label: t('settings.themeLight') },
    { value: 'dark', label: t('settings.themeDark') },
  ];

  const onToggleNudge = async (next: boolean) => {
    if (next) {
      const ok = await scheduleWeeklyNudge();
      setNudgeEnabled(ok);
    } else {
      await cancelWeeklyNudge();
      setNudgeEnabled(false);
    }
  };

  const onPickLanguage = (next: Language) => {
    haptics.selection();
    setLanguage(next);
  };

  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <Screen scroll edges={['top', 'bottom']}>
      <ScreenHeader title={t('settings.title')} onBack={() => router.back()} />

      <View style={{ gap: theme.space['2xl'], paddingTop: theme.space.md }}>
        <Group title={t('settings.language')}>
          <View>
            {LANGUAGES.map((item, i) => (
              <View key={item.code}>
                {i > 0 ? <Divider /> : null}
                <PressableRow
                  title={item.native}
                  subtitle={item.name}
                  trailing={
                    language === item.code ? (
                      <CheckIcon size={20} color={theme.color.accent.text} strokeWidth={2.5} />
                    ) : undefined
                  }
                  onPress={() => onPickLanguage(item.code)}
                />
              </View>
            ))}
          </View>
          <Text variant="caption" color="muted">
            {t('settings.rtlNote')}
          </Text>
        </Group>

        <Group title={t('settings.appearance')}>
          <SegmentedControl
            options={themeOptions}
            value={preference}
            onChange={setPreference}
            accessibilityLabel={t('settings.appearance')}
          />
        </Group>

        <Group title={t('settings.paymentDayTitle')}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: theme.space.sm,
            }}
          >
            <Text variant="body" color="secondary">
              {t('settings.paymentDay')}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.md }}>
              <StepButton Icon={MinusIcon} label={t('settings.paymentEarlier')} onPress={() => setPaymentDay(paymentDay - 1)} />
              <Text variant="monoLg" style={{ minWidth: 28, textAlign: 'center' }}>
                {paymentDay}
              </Text>
              <StepButton Icon={PlusIcon} label={t('settings.paymentLater')} onPress={() => setPaymentDay(paymentDay + 1)} />
            </View>
          </View>
        </Group>

        <Group title={t('settings.currency')}>
          <View>
            {CURRENCIES.map((item, i) => (
              <View key={item.code}>
                {i > 0 ? <Divider /> : null}
                <PressableRow
                  title={item.name}
                  subtitle={item.code}
                  trailing={
                    currency === item.code ? (
                      <CheckIcon size={20} color={theme.color.accent.text} strokeWidth={2.5} />
                    ) : undefined
                  }
                  onPress={() => {
                    haptics.selection();
                    setCurrency(item.code);
                  }}
                />
              </View>
            ))}
          </View>
        </Group>

        <Group title={t('settings.reminders')}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: theme.space.xs,
            }}
          >
            <View style={{ flex: 1, paddingRight: theme.space.md, gap: 2 }}>
              <Text variant="body">{t('settings.nudge')}</Text>
              <Text variant="bodySm" color="secondary">
                {t('settings.nudgeSub')}
              </Text>
            </View>
            <Switch
              value={nudgeEnabled}
              onValueChange={onToggleNudge}
              trackColor={{ true: theme.color.accent.solid, false: theme.color.border.default }}
              accessibilityLabel={t('settings.nudge')}
            />
          </View>
        </Group>

        <Group title={t('settings.pro')}>
          <View>
            <Divider />
            <PressableRow
              title={isPro ? t('settings.proHave') : t('settings.proUpgrade')}
              subtitle={isPro ? t('settings.proHaveSub') : t('settings.proUpgradeSub')}
              showChevron={!isPro}
              onPress={() => router.push('/paywall')}
            />
            <Divider />
          </View>
        </Group>

        <View style={{ alignItems: 'center', paddingTop: theme.space.lg, gap: 2 }}>
          <Text variant="caption" color="muted">
            Solvent {version}
          </Text>
          <Text variant="caption" color="muted">
            {t('settings.footerBuilt')}
          </Text>
        </View>
      </View>
    </Screen>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.space.md }}>
      <Text variant="subtitle">{title}</Text>
      {children}
    </View>
  );
}

function StepButton({
  Icon,
  label,
  onPress,
}: {
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  label: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      onPress={() => {
        haptics.selection();
        onPress();
      }}
      style={{
        width: 40,
        height: 40,
        borderRadius: theme.radii.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.color.bg.subtle,
      }}
    >
      <Icon size={18} color={theme.color.text.primary} strokeWidth={2} />
    </Pressable>
  );
}
