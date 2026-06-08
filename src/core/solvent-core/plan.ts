// solvent-core: the unified plan + what-if layer the app talks to.
//
// One Plan shape covers both goal kinds, so the UI renders "your date" the same way
// whether you are paying off debt or saving toward a target. what-if answers the single
// most motivating question: "what does an extra X per month do to my date?"

import type { Minor } from './money';
import type { SolventDate } from './dates';
import type { DebtStrategy, GoalKind, MonthRow, ProjectionStatus } from './types';
import { computePayoff, type PayoffInput } from './payoff';
import { computeSavings, type SavingsInput } from './savings';

export interface Plan {
  kind: GoalKind;
  status: ProjectionStatus;
  /** Months until the goal. 0 when already there. */
  months: number;
  /** Payoff date (debt) or reach date (savings). The hero number. */
  date: SolventDate;
  startDate: SolventDate;
  /** Monthly budget (debt) or monthly contribution (savings), in minor units. */
  monthlyAmount: Minor;
  /** Interest charged (debt) or yield earned (savings), in minor units. */
  totalInterest: Minor;
  /** Total paid (debt) or total contributed (savings), in minor units. */
  totalApplied: Minor;
  schedule: MonthRow[];
  strategy?: DebtStrategy;
  order?: string[];
  neverReason?: string;
}

export type PlanRequest =
  | { kind: 'debt_free'; payoff: PayoffInput }
  | { kind: 'savings_target'; savings: SavingsInput };

export function computePlan(request: PlanRequest): Plan {
  if (request.kind === 'debt_free') {
    const r = computePayoff(request.payoff);
    return {
      kind: 'debt_free',
      status: r.status,
      months: r.months,
      date: r.payoffDate,
      startDate: request.payoff.startDate,
      monthlyAmount: r.monthlyBudget,
      totalInterest: r.totalInterest,
      totalApplied: r.totalPaid,
      schedule: r.schedule,
      strategy: r.strategy,
      order: r.order,
      neverReason: r.neverReason,
    };
  }
  const r = computeSavings(request.savings);
  return {
    kind: 'savings_target',
    status: r.status,
    months: r.months,
    date: r.reachDate,
    startDate: request.savings.startDate,
    monthlyAmount: r.monthlyContribution,
    totalInterest: r.totalYield,
    totalApplied: r.totalContributed,
    schedule: r.schedule,
    neverReason: r.neverReason,
  };
}

export interface WhatIfResult {
  /** The extra amount per month being tested, in minor units (can be negative). */
  extraPerMonth: Minor;
  baseStatus: ProjectionStatus;
  newStatus: ProjectionStatus;
  baseMonths: number;
  newMonths: number;
  /** Positive when the new plan finishes sooner. */
  monthsSooner: number;
  baseDate: SolventDate;
  newDate: SolventDate;
  /** Interest/charges avoided by the extra amount, in minor units. Positive = saved. */
  interestSaved: Minor;
}

function withExtra(request: PlanRequest, extra: Minor): PlanRequest {
  if (request.kind === 'debt_free') {
    const next: PayoffInput = {
      ...request.payoff,
      monthlyBudget: Math.max(0, request.payoff.monthlyBudget + extra),
    };
    return { kind: 'debt_free', payoff: next };
  }
  const next: SavingsInput = {
    ...request.savings,
    monthlyContribution: Math.max(0, request.savings.monthlyContribution + extra),
  };
  return { kind: 'savings_target', savings: next };
}

/** Compare the base plan against the same plan with an extra amount per month. */
export function whatIf(request: PlanRequest, extraPerMonth: Minor): WhatIfResult {
  const base = computePlan(request);
  const next = computePlan(withExtra(request, extraPerMonth));
  return {
    extraPerMonth,
    baseStatus: base.status,
    newStatus: next.status,
    baseMonths: base.months,
    newMonths: next.months,
    monthsSooner: base.months - next.months,
    baseDate: base.date,
    newDate: next.date,
    interestSaved: base.totalInterest - next.totalInterest,
  };
}
