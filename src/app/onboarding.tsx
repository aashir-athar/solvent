// Onboarding: privacy promise, one guided entry, then the date. Three steps, one aha.
// Lever: peak-end rule. The reveal (step 3) carries the emotional weight of the whole
// first session, so it gets the hero treatment.
// Copy: Schwartz problem/solution-aware about money; unaware on-device no-bank-link
// exists, so step 1 reveals the mechanism plainly. PAS -> guided entry -> BAB payoff.

import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeOut, ReduceMotion } from 'react-native-reanimated';
import {
  Button,
  MoneyField,
  PhoneKeyholeIcon,
  Screen,
  Text,
  TextField,
} from '@/components';
import { useTheme } from '@/theme';
import {
  clampDay,
  computePlan,
  fromJSDate,
  makeDate,
  type Plan,
} from '@/core';
import { useDebtsStore } from '@/stores/useDebtsStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { TemplateCoach } from '@/features/coach/coach';
import { formatLongDate } from '@/lib/format';
import { haptics } from '@/lib/haptics';
import { useTranslation } from '@/i18n';

type Step = 1 | 2 | 3;

export default function Onboarding() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const addDebt = useDebtsStore((s) => s.add);
  const setHasOnboarded = useSettingsStore((s) => s.setHasOnboarded);
  const setExtraPerMonth = useSettingsStore((s) => s.setExtraPerMonth);
  const currency = useSettingsStore((s) => s.currency);

  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState('Credit card');
  const [balance, setBalance] = useState<number | undefined>(undefined);
  const [aprText, setAprText] = useState('');
  const [minPayment, setMinPayment] = useState<number | undefined>(undefined);
  const [monthly, setMonthly] = useState<number | undefined>(undefined);

  const apr = aprText.trim() === '' ? 0 : Number.parseFloat(aprText);
  const aprValid = Number.isFinite(apr) && apr >= 0 && apr <= 200;
  const hasData = Boolean(balance && balance > 0 && monthly && monthly > 0);

  const startDate = useMemo(() => {
    const today = fromJSDate(new Date());
    return makeDate(today.year, today.month, clampDay(today.year, today.month, 1));
  }, []);

  const preview: Plan | null = useMemo(() => {
    if (!hasData) return null;
    return computePlan({
      kind: 'debt_free',
      payoff: {
        debts: [{ id: 'preview', name: name || 'Debt', balance: balance ?? 0, apr: aprValid ? apr : 0, minPayment: minPayment ?? 0 }],
        monthlyBudget: monthly ?? 0,
        strategy: 'avalanche',
        startDate,
      },
    });
  }, [hasData, name, balance, apr, aprValid, minPayment, monthly, startDate]);

  const goReveal = () => {
    haptics.medium();
    setStep(3);
  };

  const finishWithData = async () => {
    if (!balance) return;
    haptics.success();
    await addDebt({ name: name || 'Debt', balance, apr: aprValid ? apr : 0, minPayment: minPayment ?? 0 });
    setExtraPerMonth(Math.max(0, (monthly ?? 0) - (minPayment ?? 0)));
    setHasOnboarded(true);
    router.replace('/(tabs)');
  };

  const finishEmpty = () => {
    setHasOnboarded(true);
    router.replace('/(tabs)/add');
  };

  return (
    <Screen scroll keyboardAware contentContainerStyle={{ paddingTop: theme.space.xl, gap: theme.space.xl }}>
      <Dots step={step} />

      {step === 1 ? (
        <Animated.View
          key="s1"
          entering={FadeInDown.duration(300).reduceMotion(ReduceMotion.System)}
          exiting={FadeOut.duration(120)}
          style={{ flex: 1, gap: theme.space['2xl'], paddingTop: theme.space['4xl'] }}
        >
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: theme.radii['2xl'],
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.color.accent.subtle,
            }}
          >
            <PhoneKeyholeIcon size={34} color={theme.color.accent.text} strokeWidth={1.8} />
          </View>
          <View style={{ gap: theme.space.md }}>
            <Text variant="display">{t('onboarding.privacy.title')}</Text>
            <Text variant="body" color="secondary" style={{ maxWidth: 340 }}>
              {t('onboarding.privacy.body')}
            </Text>
          </View>
          <View style={{ marginTop: 'auto', gap: theme.space.sm, paddingTop: theme.space['2xl'] }}>
            <Button label={t('onboarding.privacy.cta')} onPress={() => setStep(2)} />
          </View>
        </Animated.View>
      ) : null}

      {step === 2 ? (
        <Animated.View
          key="s2"
          entering={FadeInDown.duration(300).reduceMotion(ReduceMotion.System)}
          exiting={FadeOut.duration(120)}
          style={{ gap: theme.space.lg }}
        >
          <View style={{ gap: theme.space.sm }}>
            <Text variant="h1">{t('onboarding.entry.title')}</Text>
            <Text variant="body" color="secondary" style={{ maxWidth: 340 }}>
              {t('onboarding.entry.body')}
            </Text>
          </View>

          <TextField label={t('onboarding.entry.name')} value={name} onChangeText={setName} placeholder="Credit card" />
          <MoneyField label={t('onboarding.entry.balance')} value={balance} onChangeMinor={setBalance} placeholder="0.00" />
          <View style={{ flexDirection: 'row', gap: theme.space.md }}>
            <View style={{ flex: 1 }}>
              <TextField
                label={t('onboarding.entry.apr')}
                value={aprText}
                onChangeText={setAprText}
                keyboardType="decimal-pad"
                placeholder="0"
                error={aprText !== '' && !aprValid ? t('onboarding.entry.checkRate') : undefined}
              />
            </View>
            <View style={{ flex: 1 }}>
              <MoneyField label={t('onboarding.entry.min')} value={minPayment} onChangeMinor={setMinPayment} placeholder="0.00" />
            </View>
          </View>
          <MoneyField
            label={t('onboarding.entry.monthly')}
            value={monthly}
            onChangeMinor={setMonthly}
            helper={t('onboarding.entry.monthlyHelper')}
            placeholder="0.00"
          />

          <View style={{ gap: theme.space.md, marginTop: theme.space.md }}>
            <Button label={t('onboarding.entry.cta')} onPress={goReveal} disabled={!hasData} />
            <Button label={t('onboarding.entry.later')} variant="ghost" onPress={() => setStep(3)} hapticOnPress={false} />
          </View>
        </Animated.View>
      ) : null}

      {step === 3 ? (
        <Animated.View
          key="s3"
          entering={FadeInDown.duration(360).reduceMotion(ReduceMotion.System)}
          style={{ flex: 1, gap: theme.space.xl, paddingTop: theme.space['2xl'] }}
        >
          {preview && preview.status === 'reached' ? (
            <RevealReached plan={preview} currency={currency} onStart={finishWithData} onAdjust={() => setStep(2)} />
          ) : preview && preview.status === 'never' ? (
            <RevealNever reason={preview.neverReason} onAdjust={() => setStep(2)} />
          ) : (
            <RevealEmpty onAdd={finishEmpty} />
          )}
        </Animated.View>
      ) : null}
    </Screen>
  );
}

function Dots({ step }: { step: Step }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: theme.space.xs }} accessibilityLabel={`Step ${step} of 3`}>
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          style={{
            width: i === step ? 20 : 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: i === step ? theme.color.accent.solid : theme.color.border.default,
          }}
        />
      ))}
    </View>
  );
}

function RevealReached({
  plan,
  currency,
  onStart,
  onAdjust,
}: {
  plan: Plan;
  currency: string;
  onStart: () => void;
  onAdjust: () => void;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <>
      <View style={{ gap: theme.space.sm }}>
        <Text variant="overline" color="muted">
          {t('onboarding.reveal.overline')}
        </Text>
        <Text variant="hero" color="accent">
          {formatLongDate(plan.date)}
        </Text>
      </View>
      <Text variant="body" color="secondary" style={{ maxWidth: 360 }}>
        {TemplateCoach.summary(plan, { currency, debtCount: 1 })}
      </Text>
      <View style={{ marginTop: 'auto', gap: theme.space.sm, paddingTop: theme.space['2xl'] }}>
        <Text variant="bodySm" color="muted">
          {t('onboarding.reveal.note')}
        </Text>
        <Button label={t('onboarding.reveal.start')} onPress={onStart} />
        <Button label={t('onboarding.reveal.change')} variant="ghost" onPress={onAdjust} hapticOnPress={false} />
      </View>
    </>
  );
}

function RevealNever({ reason, onAdjust }: { reason?: string; onAdjust: () => void }) {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <>
      <View style={{ gap: theme.space.sm }}>
        <Text variant="overline" color="muted">
          {t('onboarding.reveal.almostOverline')}
        </Text>
        <Text variant="h1">{t('onboarding.reveal.almostTitle')}</Text>
      </View>
      <Text variant="body" color="secondary" style={{ maxWidth: 360 }}>
        {reason ?? t('onboarding.reveal.almostBody')}
      </Text>
      <View style={{ marginTop: 'auto', paddingTop: theme.space['2xl'] }}>
        <Button label={t('onboarding.reveal.change')} onPress={onAdjust} />
      </View>
    </>
  );
}

function RevealEmpty({ onAdd }: { onAdd: () => void }) {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <>
      <View style={{ gap: theme.space.sm }}>
        <Text variant="h1">{t('onboarding.reveal.emptyTitle')}</Text>
        <Text variant="body" color="secondary" style={{ maxWidth: 360 }}>
          {t('onboarding.reveal.emptyBody')}
        </Text>
      </View>
      <View style={{ marginTop: 'auto', paddingTop: theme.space['2xl'] }}>
        <Button label={t('onboarding.reveal.addDebt')} onPress={onAdd} />
      </View>
    </>
  );
}
