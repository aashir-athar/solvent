// Add & adjust: the guided entry. "Tell Solvent what you owe and earn." Writes straight
// to settings so the date on the home tab updates the moment you change something.

import { View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Button,
  CreditCardIcon,
  Divider,
  MoneyField,
  PressableRow,
  Screen,
  SegmentedControl,
  Text,
  TextField,
} from '@/components';
import { useTheme } from '@/theme';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useDebtsStore } from '@/stores/useDebtsStore';
import { currencySymbol } from '@/lib/format';
import { useTranslation } from '@/i18n';
import type { GoalKind } from '@/core';

export default function AddScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const goalKind = useSettingsStore((s) => s.goalKind);
  const setGoalKind = useSettingsStore((s) => s.setGoalKind);
  const currency = useSettingsStore((s) => s.currency);
  const locale = useSettingsStore((s) => s.locale);
  const symbol = currencySymbol(currency, locale);

  const GOAL_OPTIONS: ReadonlyArray<{ value: GoalKind; label: string }> = [
    { value: 'debt_free', label: t('add.goalDebt') },
    { value: 'savings_target', label: t('add.goalSavings') },
  ];

  return (
    <Screen scroll keyboardAware>
      <View style={{ paddingTop: theme.space.sm, gap: theme.space.xl }}>
        <View style={{ gap: theme.space.xs }}>
          <Text variant="title">{t('add.title')}</Text>
          <Text variant="body" color="secondary">
            {t('add.body')}
          </Text>
        </View>

        <SegmentedControl options={GOAL_OPTIONS} value={goalKind} onChange={setGoalKind} accessibilityLabel="Goal type" />

        {goalKind === 'debt_free' ? <DebtControls symbol={symbol} /> : <SavingsControls symbol={symbol} />}

        <Text variant="caption" color="muted">
          {t('add.currencyNote', { currency })}
        </Text>
      </View>
    </Screen>
  );
}

function DebtControls({ symbol }: { symbol: string }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const debts = useDebtsStore((s) => s.debts);
  const extraPerMonth = useSettingsStore((s) => s.extraPerMonth);
  const setExtraPerMonth = useSettingsStore((s) => s.setExtraPerMonth);

  return (
    <View style={{ gap: theme.space.lg }}>
      <View>
        <Divider />
        <PressableRow
          title={t('add.debt.your')}
          subtitle={debts.length === 0 ? t('add.debt.none') : t('add.debt.count', { count: debts.length })}
          Icon={CreditCardIcon}
          value=""
          showChevron
          onPress={() => router.push('/(tabs)/goals')}
        />
        <Divider />
      </View>

      <Button label={t('add.debt.add')} onPress={() => router.push('/debt/new')} />
      <Button label={t('add.debt.scan')} variant="secondary" onPress={() => router.push('/scan')} />

      <MoneyField
        label={t('add.debt.extra')}
        value={extraPerMonth || undefined}
        onChangeMinor={(v) => setExtraPerMonth(v ?? 0)}
        currencySymbol={symbol}
        helper={t('add.debt.extraHelper')}
        placeholder="0.00"
      />
    </View>
  );
}

function SavingsControls({ symbol }: { symbol: string }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const savings = useSettingsStore((s) => s.savings);
  const setSavings = useSettingsStore((s) => s.setSavings);

  return (
    <View style={{ gap: theme.space.lg }}>
      <TextField
        label={t('add.savings.name')}
        value={savings.name}
        onChangeText={(name) => setSavings({ name })}
        placeholder="Emergency fund"
      />
      <MoneyField
        label={t('add.savings.target')}
        value={savings.target || undefined}
        onChangeMinor={(v) => setSavings({ target: v ?? 0 })}
        currencySymbol={symbol}
      />
      <MoneyField
        label={t('add.savings.current')}
        value={savings.current || undefined}
        onChangeMinor={(v) => setSavings({ current: v ?? 0 })}
        currencySymbol={symbol}
      />
      <MoneyField
        label={t('add.savings.monthly')}
        value={savings.monthlyContribution || undefined}
        onChangeMinor={(v) => setSavings({ monthlyContribution: v ?? 0 })}
        currencySymbol={symbol}
        helper={t('add.savings.monthlyHelper')}
      />
      <TextField
        label={t('add.savings.apy')}
        value={savings.apy ? String(savings.apy) : ''}
        onChangeText={(t) => {
          const n = Number.parseFloat(t.replace(/[^0-9.]/g, ''));
          setSavings({ apy: Number.isFinite(n) ? n : 0 });
        }}
        keyboardType="decimal-pad"
        placeholder="0"
        helper={t('add.savings.apyHelper')}
      />
    </View>
  );
}
