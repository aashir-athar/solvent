// Insights (Pro). Everything here is computed by the engine: where your interest goes,
// how the two strategies compare, and what a little more each month buys you. Lever:
// honest agency. No invented numbers, no pressure.

import { useMemo } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  BarChartIcon,
  Button,
  Divider,
  EmptyState,
  Screen,
  Text,
  TrendingDownIcon,
} from '@/components';
import { useTheme } from '@/theme';
import { useEntitlement } from '@/features/paywall/entitlement';
import { usePlan } from '@/hooks/usePlan';
import { useDebtsStore } from '@/stores/useDebtsStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import {
  clampDay,
  computePayoff,
  fromJSDate,
  makeDate,
  minimumsTotal,
  type Debt as EngineDebt,
} from '@/core';
import { formatMoney, formatSooner } from '@/lib/format';
import { useTranslation } from '@/i18n';

export default function InsightsScreen() {
  const { isPro } = useEntitlement();
  if (!isPro) return <LockedInsights />;
  return <UnlockedInsights />;
}

function LockedInsights() {
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <Screen>
      <View style={{ paddingTop: 8 }}>
        <Text variant="title">{t('insights.title')}</Text>
      </View>
      <EmptyState
        Icon={BarChartIcon}
        title={t('insights.lockedTitle')}
        message={t('insights.lockedBody')}
        actionLabel={t('insights.unlock')}
        onAction={() => router.push('/paywall')}
      />
    </Screen>
  );
}

function UnlockedInsights() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { plan, previewWhatIf, principal } = usePlan();
  const debts = useDebtsStore((s) => s.debts);
  const currency = useSettingsStore((s) => s.currency);
  const locale = useSettingsStore((s) => s.locale);
  const goalKind = useSettingsStore((s) => s.goalKind);
  const extraPerMonth = useSettingsStore((s) => s.extraPerMonth);
  const paymentDay = useSettingsStore((s) => s.paymentDay);

  const comparison = useMemo(() => {
    if (goalKind !== 'debt_free' || debts.length === 0) return null;
    const today = fromJSDate(new Date());
    const startDate = makeDate(today.year, today.month, clampDay(today.year, today.month, paymentDay));
    const engineDebts: EngineDebt[] = debts.map((d) => ({
      id: d.id,
      name: d.name,
      balance: d.balance,
      apr: d.apr,
      minPayment: d.minPayment,
      priority: d.priority,
    }));
    const monthlyBudget = minimumsTotal(engineDebts) + extraPerMonth;
    const avalanche = computePayoff({ debts: engineDebts, monthlyBudget, strategy: 'avalanche', startDate });
    const snowball = computePayoff({ debts: engineDebts, monthlyBudget, strategy: 'snowball', startDate });
    return { avalanche, snowball };
  }, [goalKind, debts, extraPerMonth, paymentDay]);

  if (plan.status !== 'reached') {
    return (
      <Screen>
        <View style={{ paddingTop: 8 }}>
          <Text variant="title">{t('insights.title')}</Text>
        </View>
        <EmptyState
          Icon={BarChartIcon}
          title={t('insights.emptyTitle')}
          message={t('insights.emptyBody')}
          actionLabel={t('insights.emptyCta')}
          onAction={() => router.push('/(tabs)/add')}
        />
      </Screen>
    );
  }

  const interest = plan.totalInterest;
  const total = plan.totalApplied || 1;
  const interestPct = Math.round((interest / total) * 100);
  const sensitivities = [2500, 5000, 10000].map((extra) => ({ extra, result: previewWhatIf(extra) }));

  return (
    <Screen scroll>
      <View style={{ paddingTop: 8, gap: theme.space['2xl'] }}>
        <Text variant="title">{t('insights.title')}</Text>

        <Section title={goalKind === 'savings_target' ? t('insights.whereSavings') : t('insights.whereDebt')}>
          <View style={{ flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden' }}>
            <View style={{ flex: Math.max(1, 100 - interestPct), backgroundColor: theme.color.accent.solid }} />
            <View style={{ flex: Math.max(1, interestPct), backgroundColor: theme.color.status.warning }} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.space.sm }}>
            <Legend color={theme.color.accent.solid} label={goalKind === 'savings_target' ? t('insights.legendContributions') : t('insights.legendBalance')} value={formatMoney(total - interest, currency, locale)} />
            <Legend color={theme.color.status.warning} label={goalKind === 'savings_target' ? t('insights.legendEarned') : t('insights.legendInterest')} value={formatMoney(interest, currency, locale)} align="right" />
          </View>
          <Text variant="bodySm" color="secondary" style={{ marginTop: theme.space.sm }}>
            {t('insights.interestPct', { pct: interestPct })}
          </Text>
        </Section>

        {comparison ? (
          <Section title={t('insights.compare')}>
            <CompareRow
              label="Avalanche"
              months={comparison.avalanche.months}
              interest={comparison.avalanche.totalInterest}
              status={comparison.avalanche.status}
              currency={currency}
              locale={locale}
            />
            <Divider />
            <CompareRow
              label="Snowball"
              months={comparison.snowball.months}
              interest={comparison.snowball.totalInterest}
              status={comparison.snowball.status}
              currency={currency}
              locale={locale}
            />
            <Text variant="bodySm" color="secondary" style={{ marginTop: theme.space.sm }}>
              {comparison.avalanche.totalInterest <= comparison.snowball.totalInterest
                ? t('insights.compareAvalancheWins', { amount: formatMoney(comparison.snowball.totalInterest - comparison.avalanche.totalInterest, currency, locale) })
                : t('insights.compareClose')}
            </Text>
          </Section>
        ) : null}

        <Section title={t('insights.whatMore')}>
          {sensitivities.map(({ extra, result }) => (
            <View key={extra}>
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: theme.space.sm, gap: theme.space.sm }}>
                <TrendingDownIcon size={18} color={theme.color.accent.text} strokeWidth={2} />
                <Text variant="bodyMedium" style={{ flex: 1 }}>
                  + {formatMoney(extra, currency, locale)}/mo
                </Text>
                <Text variant="monoMedium" color="accent">
                  {formatSooner(result.monthsSooner)}
                </Text>
              </View>
              <Divider />
            </View>
          ))}
        </Section>
      </View>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.space.md }}>
      <Text variant="subtitle">{title}</Text>
      {children}
    </View>
  );
}

function Legend({ color, label, value, align = 'left' }: { color: string; label: string; value: string; align?: 'left' | 'right' }) {
  return (
    <View style={{ gap: 2, alignItems: align === 'right' ? 'flex-end' : 'flex-start' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
        <Text variant="caption" color="secondary">
          {label}
        </Text>
      </View>
      <Text variant="monoMedium" align={align}>
        {value}
      </Text>
    </View>
  );
}

function CompareRow({
  label,
  months,
  interest,
  status,
  currency,
  locale,
}: {
  label: string;
  months: number;
  interest: number;
  status: string;
  currency: string;
  locale?: string;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: theme.space.sm }}>
      <Text variant="bodyMedium" style={{ flex: 1 }}>
        {label}
      </Text>
      <View style={{ alignItems: 'flex-end' }}>
        <Text variant="monoMedium">{status === 'reached' ? t('insights.months', { months }) : t('insights.noEnd')}</Text>
        <Text variant="caption" color="secondary">
          {t('insights.interestLabel', { amount: formatMoney(interest, currency, locale) })}
        </Text>
      </View>
    </View>
  );
}
