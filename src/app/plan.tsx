// The plan: show your work. A monospace, tabular, month-by-month schedule with hairline
// rules. This is the trust surface, where every figure can be audited. Lever:
// transparency reduces perceived risk in a money app.

import { View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { Divider, EmptyState, ReceiptIcon, Screen, ScreenHeader, Text } from '@/components';
import { useTheme } from '@/theme';
import { usePlan } from '@/hooks/usePlan';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { TemplateCoach } from '@/features/coach/coach';
import { formatDecimal, formatMoney, formatMonthYear } from '@/lib/format';
import { useTranslation } from '@/i18n';
import type { MonthRow } from '@/core';

export default function PlanScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { plan, debtCount, principal } = usePlan();
  const currency = useSettingsStore((s) => s.currency);
  const locale = useSettingsStore((s) => s.locale);
  const goalKind = useSettingsStore((s) => s.goalKind);

  const isSavings = goalKind === 'savings_target';
  const cols = isSavings
    ? [t('plan.colMonth'), t('plan.colAdded'), t('plan.colEarned'), t('plan.colBalance')]
    : [t('plan.colMonth'), t('plan.colPaid'), t('plan.colInterest'), t('plan.colBalance')];

  if (plan.status !== 'reached') {
    return (
      <Screen edges={['top', 'bottom']}>
        <ScreenHeader title={t('plan.title')} onBack={() => router.back()} />
        <EmptyState
          Icon={ReceiptIcon}
          title={t('plan.emptyTitle')}
          message={plan.neverReason ?? t('plan.emptyBody')}
          actionLabel={t('plan.emptyCta')}
          onAction={() => router.replace('/(tabs)/add')}
        />
      </Screen>
    );
  }

  const lastIndex = plan.schedule.length - 1;

  return (
    <Screen padded={false} edges={['top', 'bottom']}>
      <View style={{ paddingHorizontal: theme.space.lg }}>
        <ScreenHeader title={t('plan.title')} onBack={() => router.back()} />
      </View>

      <FlashList
        data={plan.schedule}
        keyExtractor={(row) => String(row.index)}
        contentContainerStyle={{ paddingHorizontal: theme.space.lg, paddingBottom: theme.space['5xl'] }}
        ListHeaderComponent={
          <View style={{ gap: theme.space.lg, paddingBottom: theme.space.sm }}>
            <Text variant="body" color="secondary">
              {TemplateCoach.summary(plan, { currency, locale, debtCount, targetAmount: isSavings ? principal : undefined })}
            </Text>
            <View style={{ flexDirection: 'row', paddingBottom: theme.space.xs }}>
              <Text variant="overline" color="muted" style={{ flex: 1.3 }}>
                {cols[0]}
              </Text>
              <Text variant="overline" color="muted" style={{ flex: 1, textAlign: 'right' }}>
                {cols[1]}
              </Text>
              <Text variant="overline" color="muted" style={{ flex: 1, textAlign: 'right' }}>
                {cols[2]}
              </Text>
              <Text variant="overline" color="muted" style={{ flex: 1.3, textAlign: 'right' }}>
                {cols[3]}
              </Text>
            </View>
            <Divider strong />
          </View>
        }
        renderItem={({ item, index }) => (
          <ScheduleRow row={item} currency={currency} locale={locale} isLast={index === lastIndex} />
        )}
        ItemSeparatorComponent={() => <Divider />}
        ListFooterComponent={
          <View style={{ paddingTop: theme.space.lg, gap: theme.space.xs }}>
            <Divider strong />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: theme.space.md }}>
              <Text variant="label" color="secondary">
                {isSavings ? t('plan.totalEarned') : t('plan.totalInterest')}
              </Text>
              <Text variant="monoMedium">{formatMoney(plan.totalInterest, currency, locale)}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text variant="label" color="secondary">
                {isSavings ? t('plan.totalContributed') : t('plan.totalPaid')}
              </Text>
              <Text variant="monoMedium">{formatMoney(plan.totalApplied, currency, locale)}</Text>
            </View>
          </View>
        }
      />
    </Screen>
  );
}

function ScheduleRow({
  row,
  currency,
  locale,
  isLast,
}: {
  row: MonthRow;
  currency: string;
  locale?: string;
  isLast: boolean;
}) {
  const theme = useTheme();
  const color = isLast ? 'accent' : 'primary';
  return (
    <View style={{ flexDirection: 'row', paddingVertical: theme.space.sm, alignItems: 'center' }}>
      <Text variant="monoSm" color={color} style={{ flex: 1.3 }}>
        {formatMonthYear(row.date)}
      </Text>
      <Text variant="monoSm" color={color} style={{ flex: 1, textAlign: 'right' }}>
        {formatDecimal(row.applied, locale)}
      </Text>
      <Text variant="monoSm" color="muted" style={{ flex: 1, textAlign: 'right' }}>
        {formatDecimal(row.interest, locale)}
      </Text>
      <Text variant="monoSm" color={color} style={{ flex: 1.3, textAlign: 'right' }}>
        {isLast ? formatMoney(row.endingBalance, currency, locale) : formatDecimal(row.endingBalance, locale)}
      </Text>
    </View>
  );
}
