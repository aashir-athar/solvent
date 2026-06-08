// The Date. The whole product in one screen: a number you can feel, plus the one lever
// that moves it. Lever: peak-end rule (the date reveal) + honest agency (the slider only
// ever shows true outcomes from the engine).

import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from '@/i18n';
import Animated, { FadeIn, FadeInDown, ReduceMotion } from 'react-native-reanimated';
import {
  AppSlider,
  Button,
  CreditCardIcon,
  Divider,
  EmptyState,
  PressableRow,
  ReceiptIcon,
  Screen,
  SettingsIcon,
  Skeleton,
  SparkleIcon,
  Text,
  TrendingDownIcon,
} from '@/components';
import { useTheme } from '@/theme';
import { usePlan } from '@/hooks/usePlan';
import { formatProgress, useMilestones } from '@/hooks/useMilestones';
import { useDebtsStore } from '@/stores/useDebtsStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { TemplateCoach } from '@/features/coach/coach';
import { formatLongDate, formatMoney, formatSooner } from '@/lib/format';
import { haptics } from '@/lib/haptics';

const STEP = 1000; // $10 increments

export default function DateScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { plan, previewWhatIf, debtCount, principal } = usePlan();
  const loaded = useDebtsStore((s) => s.loaded);
  const currency = useSettingsStore((s) => s.currency);
  const locale = useSettingsStore((s) => s.locale);
  const goalKind = useSettingsStore((s) => s.goalKind);
  const extraPerMonth = useSettingsStore((s) => s.extraPerMonth);
  const setExtraPerMonth = useSettingsStore((s) => s.setExtraPerMonth);
  const milestones = useMilestones();

  const coachCtx = { currency, locale, debtCount, targetAmount: goalKind === 'savings_target' ? principal : undefined };
  const overline = goalKind === 'savings_target' ? t('date.overlineSavings') : t('date.overlineDebt');

  if (!loaded) return <LoadingDate />;

  return (
    <Screen scroll>
      <Header onSettings={() => router.push('/settings')} />

      {plan.status === 'already' && goalKind === 'debt_free' ? (
        <EmptyState
          Icon={CreditCardIcon}
          title={t('date.emptyTitle')}
          message={t('date.emptyBody')}
          actionLabel={t('date.emptyCta')}
          onAction={() => router.push('/(tabs)/add')}
        />
      ) : plan.status === 'never' ? (
        <NeverState reason={plan.neverReason} onAdjust={() => router.push('/(tabs)/add')} />
      ) : (
        <View style={{ gap: theme.space['2xl'], paddingTop: theme.space['2xl'] }}>
          <Animated.View
            key={`date-${plan.status}-${plan.date.year}-${plan.date.month}-${plan.date.day}`}
            entering={FadeInDown.duration(420).reduceMotion(ReduceMotion.System)}
            style={{ gap: theme.space.sm }}
          >
            <Text variant="overline" color="muted">
              {overline}
            </Text>
            <Text variant="hero" color="accent" accessibilityRole="header">
              {formatLongDate(plan.date)}
            </Text>
            <Text variant="body" color="secondary" style={{ maxWidth: 360 }}>
              {TemplateCoach.summary(plan, coachCtx)}
            </Text>
            {milestones.hasProgress ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.xs, paddingTop: theme.space.xs }}>
                <TrendingDownIcon size={16} color={theme.color.accent.text} strokeWidth={2} />
                <Text variant="bodySm" color="accent">
                  {formatProgress(milestones)}
                </Text>
              </View>
            ) : null}
          </Animated.View>

          <WhatIfCard
            base={plan.monthlyAmount}
            currency={currency}
            locale={locale}
            preview={previewWhatIf}
            onCommit={(extra) => {
              haptics.success();
              setExtraPerMonth(extraPerMonth + extra);
            }}
          />

          <View>
            <Divider />
            <PressableRow
              title={t('date.seePlan')}
              subtitle={t('date.seePlanSub')}
              Icon={ReceiptIcon}
              showChevron
              onPress={() => router.push('/plan')}
            />
            <Divider />
            <PressableRow
              title={t('date.why')}
              subtitle={t('date.whySub')}
              Icon={SparkleIcon}
              showChevron
              onPress={() => router.push('/why')}
            />
            <Divider />
          </View>
        </View>
      )}
    </Screen>
  );
}

function Header({ onSettings }: { onSettings: () => void }) {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: theme.space.sm,
      }}
    >
      <Text variant="title">Solvent</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('date.settings')}
        hitSlop={10}
        onPress={onSettings}
        style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
      >
        <SettingsIcon size={22} color={theme.color.text.secondary} strokeWidth={2} />
      </Pressable>
    </View>
  );
}

function WhatIfCard({
  base,
  currency,
  locale,
  preview,
  onCommit,
}: {
  base: number;
  currency: string;
  locale?: string;
  preview: ReturnType<typeof usePlan>['previewWhatIf'];
  onCommit: (extra: number) => void;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [extra, setExtra] = useState(0);

  const maxExtra = useMemo(() => {
    const cap = Math.max(100000, base * 3);
    return Math.ceil(cap / STEP) * STEP;
  }, [base]);

  const result = useMemo(() => (extra > 0 ? preview(extra) : null), [extra, preview]);

  return (
    <View style={{ gap: theme.space.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text variant="subtitle">{t('date.whatifTitle')}</Text>
        <Text variant="monoMedium" color="accent">
          {extra > 0 ? t('date.whatifPerMonth', { amount: formatMoney(extra, currency, locale) }) : t('date.whatifNone')}
        </Text>
      </View>

      <AppSlider
        value={extra}
        onValueChange={setExtra}
        minimumValue={0}
        maximumValue={maxExtra}
        step={STEP}
        accessibilityLabel="Extra amount per month"
      />

      {result ? (
        <Animated.View
          entering={FadeIn.duration(160).reduceMotion(ReduceMotion.System)}
          style={{ gap: theme.space.sm }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.xs }}>
            <TrendingDownIcon size={18} color={theme.color.accent.text} strokeWidth={2} />
            <Text variant="monoMedium" color="accent">
              {result.newStatus === 'reached' ? formatLongDate(result.newDate) : t('date.whatifAppears')}
            </Text>
          </View>
          <Text variant="bodySm" color="secondary">
            {TemplateCoach.whatIf(result, { currency, locale, targetAmount: undefined })}
          </Text>
          <Button
            label={t('date.whatifCommit', { amount: formatMoney(extra, currency, locale) })}
            size="sm"
            onPress={() => {
              onCommit(extra);
              setExtra(0);
            }}
          />
        </Animated.View>
      ) : (
        <Text variant="bodySm" color="muted">
          {t('date.whatifHint')}
        </Text>
      )}
    </View>
  );
}

function NeverState({ reason, onAdjust }: { reason?: string; onAdjust: () => void }) {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <View style={{ gap: theme.space.lg, paddingTop: theme.space['4xl'] }}>
      <Text variant="overline" color="muted">
        {t('date.neverOverline')}
      </Text>
      <Text variant="h1">{t('date.neverTitle')}</Text>
      <Text variant="body" color="secondary" style={{ maxWidth: 360 }}>
        {reason ?? 'Right now the monthly amount does not cover the interest, so the balance holds steady. A little more each month changes that.'}
      </Text>
      <View style={{ marginTop: theme.space.md }}>
        <Button label={t('date.neverCta')} onPress={onAdjust} fullWidth={false} />
      </View>
    </View>
  );
}

function LoadingDate() {
  const theme = useTheme();
  return (
    <Screen>
      <View style={{ paddingTop: theme.space['5xl'], gap: theme.space.xl }}>
        <Skeleton width={160} height={12} />
        <Skeleton width={'90%'} height={52} radius={theme.radii.lg} />
        <Skeleton width={'70%'} height={18} />
        <View style={{ gap: theme.space.md, marginTop: theme.space.xl }}>
          <Skeleton width={'100%'} height={40} radius={theme.radii.lg} />
          <Skeleton width={'100%'} height={56} radius={theme.radii.lg} />
          <Skeleton width={'100%'} height={56} radius={theme.radii.lg} />
        </View>
      </View>
    </Screen>
  );
}
