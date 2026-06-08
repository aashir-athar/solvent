// usePlan: the single place app data becomes "your date".
//
// This is the ONE boundary where the system clock enters the otherwise pure pipeline:
// the anchor date is read here from new Date() and handed to the deterministic engine.
// Everything downstream is reproducible from (debts, settings, anchor).

import { useMemo } from 'react';
import {
  clampDay,
  computePlan,
  fromJSDate,
  makeDate,
  minimumsTotal,
  whatIf,
  type Debt as EngineDebt,
  type Plan,
  type PlanRequest,
  type WhatIfResult,
} from '@/core';
import { useDebtsStore } from '@/stores/useDebtsStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import type { DebtRecord } from '@/db/debtsRepo';

function toEngineDebt(d: DebtRecord): EngineDebt {
  return { id: d.id, name: d.name, balance: d.balance, apr: d.apr, minPayment: d.minPayment, priority: d.priority };
}

export interface UsePlanResult {
  plan: Plan;
  request: PlanRequest;
  /** Recompute the date with an extra amount per month (minor units). */
  previewWhatIf: (extraPerMonth: number) => WhatIfResult;
  /** Original debt owed (debt goal) or the savings target. */
  principal: number;
  debtCount: number;
}

export function usePlan(): UsePlanResult {
  const debts = useDebtsStore((s) => s.debts);
  const goalKind = useSettingsStore((s) => s.goalKind);
  const strategy = useSettingsStore((s) => s.strategy);
  const extraPerMonth = useSettingsStore((s) => s.extraPerMonth);
  const paymentDay = useSettingsStore((s) => s.paymentDay);
  const savings = useSettingsStore((s) => s.savings);

  const startDate = useMemo(() => {
    const today = fromJSDate(new Date());
    return makeDate(today.year, today.month, clampDay(today.year, today.month, paymentDay));
  }, [paymentDay]);

  const request = useMemo<PlanRequest>(() => {
    if (goalKind === 'savings_target') {
      return {
        kind: 'savings_target',
        savings: {
          target: savings.target,
          current: savings.current,
          monthlyContribution: savings.monthlyContribution,
          apy: savings.apy,
          startDate,
        },
      };
    }
    const engineDebts = debts.map(toEngineDebt);
    const monthlyBudget = minimumsTotal(engineDebts) + extraPerMonth;
    return { kind: 'debt_free', payoff: { debts: engineDebts, monthlyBudget, strategy, startDate } };
  }, [goalKind, savings, debts, extraPerMonth, strategy, startDate]);

  const plan = useMemo(() => computePlan(request), [request]);

  const previewWhatIf = useMemo(
    () => (extra: number) => whatIf(request, Math.max(0, Math.round(extra))),
    [request],
  );

  const principal = plan.kind === 'debt_free' ? plan.totalApplied - plan.totalInterest : savings.target;

  return { plan, request, previewWhatIf, principal, debtCount: debts.length };
}
