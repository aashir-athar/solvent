// Milestones: honest progress. The first reached projection is captured as a baseline,
// then we show how much closer the date has moved since. Loss-aversion done ethically:
// it only ever appears when the date genuinely improved.

import { useEffect } from 'react';
import { toISO } from '@/core';
import { translate } from '@/i18n';
import { usePlan } from './usePlan';
import { useSettingsStore } from '@/stores/useSettingsStore';

export interface Milestones {
  hasBaseline: boolean;
  hasProgress: boolean;
  monthsCloser: number;
  daysCloser: number;
}

export function useMilestones(): Milestones {
  const baseline = useSettingsStore((s) => s.baseline);
  const setBaseline = useSettingsStore((s) => s.setBaseline);
  const { plan } = usePlan();

  useEffect(() => {
    if (!baseline && plan.status === 'reached') {
      setBaseline({ months: plan.months, dateISO: toISO(plan.date), setAt: Date.now() });
    }
  }, [baseline, plan.status, plan.months, plan.date, setBaseline]);

  if (!baseline || plan.status !== 'reached') {
    return { hasBaseline: Boolean(baseline), hasProgress: false, monthsCloser: 0, daysCloser: 0 };
  }

  const monthsCloser = baseline.months - plan.months;
  const daysCloser = Math.round(
    (new Date(baseline.dateISO).getTime() - new Date(toISO(plan.date)).getTime()) / 86_400_000,
  );
  return {
    hasBaseline: true,
    hasProgress: monthsCloser > 0 || daysCloser > 0,
    monthsCloser,
    daysCloser,
  };
}

/** "41 days closer" / "3 months closer", phrased for the unit that reads best. */
export function formatProgress(milestones: Milestones): string {
  if (!milestones.hasProgress) return '';
  if (milestones.daysCloser >= 60 && milestones.monthsCloser >= 2) {
    return translate('progress.monthsCloser', { months: milestones.monthsCloser });
  }
  const days = milestones.daysCloser;
  return days === 1 ? translate('progress.dayCloser') : translate('progress.daysCloser', { days });
}
