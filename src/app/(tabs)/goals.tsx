// Goals: the debt ledger with its payoff strategy, or the savings-goal progress.
// Lever: progressive disclosure. Totals up top, the order you pay in, then each debt.

import { View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import {
  Button,
  CreditCardIcon,
  Divider,
  EmptyState,
  PressableRow,
  Screen,
  SegmentedControl,
  Text,
} from '@/components';
import { useTheme } from '@/theme';
import { useDebtsStore } from '@/stores/useDebtsStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { usePlan } from '@/hooks/usePlan';
import { formatLongDate, formatMoney } from '@/lib/format';
import type { DebtRecord } from '@/db/debtsRepo';
import type { DebtStrategy } from '@/core';
import { useTranslation } from '@/i18n';

export default function GoalsScreen() {
  const goalKind = useSettingsStore((s) => s.goalKind);
  if (goalKind === 'savings_target') return <SavingsGoalView />;
  return <DebtsView />;
}

function DebtsView() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const debts = useDebtsStore((s) => s.debts);
  const currency = useSettingsStore((s) => s.currency);
  const locale = useSettingsStore((s) => s.locale);
  const strategy = useSettingsStore((s) => s.strategy);
  const setStrategy = useSettingsStore((s) => s.setStrategy);
  const { plan } = usePlan();

  const strategyOptions: ReadonlyArray<{ value: DebtStrategy; label: string }> = [
    { value: 'avalanche', label: t('goals.strategy.avalanche') },
    { value: 'snowball', label: t('goals.strategy.snowball') },
    { value: 'custom', label: t('goals.strategy.custom') },
  ];

  const totalOwed = debts.reduce((sum, d) => sum + d.balance, 0);

  return (
    <Screen padded={false}>
      <View style={{ paddingHorizontal: theme.space.lg, paddingTop: theme.space.sm }}>
        <Text variant="title">{t('goals.title')}</Text>
      </View>
      <FlashList
        data={debts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: theme.space.lg, paddingBottom: theme.space['5xl'] }}
        ListHeaderComponent={
          debts.length > 0 ? (
            <View style={{ paddingVertical: theme.space.lg, gap: theme.space.lg }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Stat label={t('goals.owed')} value={formatMoney(totalOwed, currency, locale)} />
                <Stat label={t('goals.eachMonth')} value={formatMoney(plan.monthlyAmount, currency, locale)} />
                <Stat
                  label={t('goals.freeOn')}
                  value={plan.status === 'reached' ? formatLongDate(plan.date) : t('common.notYet')}
                  align="right"
                />
              </View>
              <View style={{ gap: theme.space.xs }}>
                <Text variant="label" color="secondary">
                  {t('goals.order')}
                </Text>
                <SegmentedControl
                  options={strategyOptions}
                  value={strategy}
                  onChange={setStrategy}
                  accessibilityLabel="Payoff strategy"
                />
              </View>
              <Divider />
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <DebtRow item={item} currency={currency} locale={locale} onPress={() => router.push(`/debt/${item.id}`)} />
        )}
        ItemSeparatorComponent={() => <Divider inset={56} />}
        ListEmptyComponent={
          <EmptyState
            Icon={CreditCardIcon}
            title={t('goals.emptyTitle')}
            message={t('goals.emptyBody')}
            actionLabel={t('goals.addDebt')}
            onAction={() => router.push('/debt/new')}
          />
        }
        ListFooterComponent={
          debts.length > 0 ? (
            <View style={{ paddingTop: theme.space.xl }}>
              <Button label={t('goals.addDebt')} variant="secondary" onPress={() => router.push('/debt/new')} />
            </View>
          ) : null
        }
      />
    </Screen>
  );
}

function DebtRow({
  item,
  currency,
  locale,
  onPress,
}: {
  item: DebtRecord;
  currency: string;
  locale?: string;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const apr = item.apr % 1 === 0 ? String(item.apr) : item.apr.toFixed(2);
  const min = formatMoney(item.minPayment, currency, locale);
  const subtitle = t('goals.aprMin', { apr, min });
  return (
    <PressableRow
      title={item.name}
      subtitle={subtitle}
      value={formatMoney(item.balance, currency, locale)}
      Icon={CreditCardIcon}
      showChevron
      onPress={onPress}
    />
  );
}

function Stat({ label, value, align = 'left' }: { label: string; value: string; align?: 'left' | 'right' }) {
  return (
    <View style={{ gap: 2, alignItems: align === 'right' ? 'flex-end' : 'flex-start', maxWidth: '40%' }}>
      <Text variant="caption" color="muted">
        {label}
      </Text>
      <Text variant="monoMedium" align={align}>
        {value}
      </Text>
    </View>
  );
}

function SavingsGoalView() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const savings = useSettingsStore((s) => s.savings);
  const currency = useSettingsStore((s) => s.currency);
  const locale = useSettingsStore((s) => s.locale);
  const { plan } = usePlan();

  const progress = savings.target > 0 ? Math.min(1, savings.current / savings.target) : 0;

  return (
    <Screen scroll>
      <View style={{ paddingTop: theme.space.sm, gap: theme.space.xl }}>
        <Text variant="title">{savings.name}</Text>

        <View style={{ gap: theme.space.sm }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text variant="monoMedium">{formatMoney(savings.current, currency, locale)}</Text>
            <Text variant="monoMedium" color="muted">
              {formatMoney(savings.target, currency, locale)}
            </Text>
          </View>
          <View style={{ height: 10, borderRadius: 5, backgroundColor: theme.color.bg.subtle, overflow: 'hidden' }}>
            <View
              style={{
                width: `${Math.round(progress * 100)}%`,
                height: '100%',
                borderRadius: 5,
                backgroundColor: theme.color.accent.solid,
              }}
            />
          </View>
          <Text variant="caption" color="secondary">
            {t('goals.savings.saved', { percent: String(Math.round(progress * 100)) })}
          </Text>
        </View>

        <View>
          <Divider />
          <PressableRow
            title={t('goals.savings.added')}
            value={formatMoney(savings.monthlyContribution, currency, locale)}
            onPress={() => router.push('/(tabs)/add')}
          />
          <Divider />
          <PressableRow
            title={t('goals.savings.onTrack')}
            value={plan.status === 'reached' ? formatLongDate(plan.date) : t('common.notYet')}
            onPress={() => router.push('/(tabs)/add')}
          />
          <Divider />
        </View>

        <Button label={t('goals.savings.edit')} variant="secondary" onPress={() => router.push('/(tabs)/add')} />
      </View>
    </Screen>
  );
}
