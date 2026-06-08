// Why this date (modal). The coach explains the number in plain language, then the
// figures it stands on. Every number here comes from the engine, not the coach.

import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Divider, Screen, ScreenHeader, Text } from '@/components';
import { useTheme } from '@/theme';
import { usePlan } from '@/hooks/usePlan';
import { useCoachMessage } from '@/hooks/useCoachMessage';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { TemplateCoach } from '@/features/coach/coach';
import { formatDuration, formatLongDate, formatMoney } from '@/lib/format';
import { useTranslation } from '@/i18n';

export default function WhyScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { plan, debtCount, principal } = usePlan();
  const currency = useSettingsStore((s) => s.currency);
  const locale = useSettingsStore((s) => s.locale);
  const goalKind = useSettingsStore((s) => s.goalKind);
  const isSavings = goalKind === 'savings_target';
  const ctx = { currency, locale, debtCount, targetAmount: isSavings ? principal : undefined };
  const { text: explanation } = useCoachMessage(TemplateCoach.whyThisDate(plan, ctx));

  return (
    <Screen scroll edges={['top', 'bottom']}>
      <ScreenHeader title={t('why.title')} onClose={() => router.back()} />

      <View style={{ gap: theme.space.xl, paddingTop: theme.space.md }}>
        {plan.status === 'reached' ? (
          <Text variant="h2" color="accent">
            {formatLongDate(plan.date)}
          </Text>
        ) : null}

        <Text variant="body" color="secondary">
          {explanation}
        </Text>

        {plan.status === 'reached' ? (
          <View>
            <Divider />
            <Figure label={isSavings ? t('why.target') : t('why.owe')} value={formatMoney(principal, currency, locale)} />
            <Divider />
            <Figure label={t('why.eachMonth')} value={formatMoney(plan.monthlyAmount, currency, locale)} />
            <Divider />
            <Figure
              label={isSavings ? t('why.interestEarned') : t('why.interestAlong')}
              value={formatMoney(plan.totalInterest, currency, locale)}
            />
            <Divider />
            <Figure label={t('why.timeToGet')} value={formatDuration(plan.months)} />
            <Divider />
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

function Figure({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: theme.space.md,
      }}
    >
      <Text variant="body" color="secondary">
        {label}
      </Text>
      <Text variant="monoMedium">{value}</Text>
    </View>
  );
}
