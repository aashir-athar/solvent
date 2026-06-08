// Native bottom tabs: the real platform tab bar (Liquid Glass on iOS 26, Material on
// Android), tinted to the spruce accent. SF Symbols on iOS, Feather on Android.

import { NativeTabs } from 'expo-router/unstable-native-tabs';
import Feather from '@expo/vector-icons/Feather';
import { useTheme } from '@/theme';
import { useTranslation } from '@/i18n';

export default function TabsLayout() {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <NativeTabs tintColor={theme.color.accent.solid} backgroundColor={theme.color.bg.surface}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>{t('tab.date')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="calendar"
          src={<NativeTabs.Trigger.VectorIcon family={Feather} name="calendar" />}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="goals">
        <NativeTabs.Trigger.Label>{t('tab.goals')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="flag.fill"
          src={<NativeTabs.Trigger.VectorIcon family={Feather} name="flag" />}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="add">
        <NativeTabs.Trigger.Label>{t('tab.add')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="plus.circle.fill"
          src={<NativeTabs.Trigger.VectorIcon family={Feather} name="plus-circle" />}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="insights">
        <NativeTabs.Trigger.Label>{t('tab.insights')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="chart.bar.fill"
          src={<NativeTabs.Trigger.VectorIcon family={Feather} name="bar-chart-2" />}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="privacy">
        <NativeTabs.Trigger.Label>{t('tab.privacy')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="lock.shield.fill"
          src={<NativeTabs.Trigger.VectorIcon family={Feather} name="shield" />}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
