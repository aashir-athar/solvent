// solvent-core: the deterministic debt payoff engine.
//
// Given a set of debts, a fixed monthly budget, and a strategy, it simulates month by
// month: accrue interest, pay every minimum, then pour whatever is left into one debt
// (chosen by strategy) and roll the overflow to the next as debts close. It returns the
// exact payoff date plus a full month-by-month schedule so every figure can be audited.
//
// All arithmetic is on integer minor units. No floats touch a balance. No system clock.

import type { Minor } from './money';
import { monthlyInterest, sumMinor } from './money';
import type { SolventDate } from './dates';
import { addMonths } from './dates';
import type { Debt, DebtStrategy, MonthRow, ProjectionStatus } from './types';

export interface PayoffInput {
  debts: readonly Debt[];
  /** Total amount available for ALL debts each month, in minor units. */
  monthlyBudget: Minor;
  strategy: DebtStrategy;
  /** Anchor date the projection counts forward from (e.g. today). */
  startDate: SolventDate;
  /** Safety cap so a "never" case terminates. Defaults to 1200 months (100 years). */
  maxMonths?: number;
}

export interface PayoffResult {
  status: ProjectionStatus;
  /** Months until debt-free. 0 when already debt-free. */
  months: number;
  /** The projected debt-free date, or the start date when already debt-free. */
  payoffDate: SolventDate;
  totalPaid: Minor;
  totalInterest: Minor;
  totalPrincipal: Minor;
  monthlyBudget: Minor;
  strategy: DebtStrategy;
  /** Per-month aggregate schedule. Empty when already debt-free. */
  schedule: MonthRow[];
  /** Debt ids in the order extra payments target them. */
  order: string[];
  /** Present only when status is 'never': a plain-language reason. */
  neverReason?: string;
}

interface Tracked {
  id: string;
  apr: number;
  minPayment: Minor;
  priority: number;
  balance: Minor;
}

/** Order debts by the chosen strategy. Returns indices into the tracked array. */
function strategyOrder(debts: readonly Tracked[], strategy: DebtStrategy): number[] {
  const indices = debts.map((_, i) => i);
  if (strategy === 'avalanche') {
    // Highest APR first. Tie-break by smaller balance, then original order.
    return indices.sort((a, b) => {
      const d = debts[b]!.apr - debts[a]!.apr;
      if (d !== 0) return d;
      const bal = debts[a]!.balance - debts[b]!.balance;
      return bal !== 0 ? bal : a - b;
    });
  }
  if (strategy === 'snowball') {
    // Smallest balance first. Tie-break by higher APR, then original order.
    return indices.sort((a, b) => {
      const d = debts[a]!.balance - debts[b]!.balance;
      if (d !== 0) return d;
      const apr = debts[b]!.apr - debts[a]!.apr;
      return apr !== 0 ? apr : a - b;
    });
  }
  // custom: by ascending priority, then original order.
  return indices.sort((a, b) => {
    const d = debts[a]!.priority - debts[b]!.priority;
    return d !== 0 ? d : a - b;
  });
}

export function computePayoff(input: PayoffInput): PayoffResult {
  const maxMonths = input.maxMonths ?? 1200;
  const strategy = input.strategy;
  const monthlyBudget = Math.max(0, Math.round(input.monthlyBudget));

  const tracked: Tracked[] = input.debts
    .filter((d) => d.balance > 0)
    .map((d, i) => ({
      id: d.id,
      apr: d.apr,
      minPayment: Math.max(0, Math.round(d.minPayment)),
      priority: d.priority ?? i,
      balance: Math.round(d.balance),
    }));

  const order = strategyOrder(tracked, strategy);
  const orderIds = order.map((i) => tracked[i]!.id);

  // Already debt-free.
  if (tracked.length === 0) {
    return {
      status: 'already',
      months: 0,
      payoffDate: input.startDate,
      totalPaid: 0,
      totalInterest: 0,
      totalPrincipal: 0,
      monthlyBudget,
      strategy,
      schedule: [],
      order: orderIds,
    };
  }

  const schedule: MonthRow[] = [];
  let totalPaid = 0;
  let totalInterest = 0;

  for (let month = 1; month <= maxMonths; month += 1) {
    const startingBalance = sumMinor(tracked.map((d) => d.balance));

    // 1. Accrue interest.
    let monthInterest = 0;
    for (const d of tracked) {
      if (d.balance <= 0) continue;
      const interest = monthlyInterest(d.balance, d.apr);
      d.balance += interest;
      monthInterest += interest;
    }

    // 2. Pay minimums in original order.
    let available = monthlyBudget;
    let monthPaid = 0;
    for (const d of tracked) {
      if (d.balance <= 0 || available <= 0) continue;
      const pay = Math.min(d.minPayment, d.balance, available);
      d.balance -= pay;
      available -= pay;
      monthPaid += pay;
    }

    // 3. Pour the remainder into debts in strategy order, rolling over as each closes.
    for (const idx of order) {
      if (available <= 0) break;
      const d = tracked[idx]!;
      if (d.balance <= 0) continue;
      const pay = Math.min(available, d.balance);
      d.balance -= pay;
      available -= pay;
      monthPaid += pay;
    }

    const endingBalance = sumMinor(tracked.map((d) => d.balance));
    schedule.push({
      index: month,
      date: addMonths(input.startDate, month),
      startingBalance,
      interest: monthInterest,
      applied: monthPaid,
      endingBalance,
    });
    totalPaid += monthPaid;
    totalInterest += monthInterest;

    if (endingBalance <= 0) {
      return {
        status: 'reached',
        months: month,
        payoffDate: addMonths(input.startDate, month),
        totalPaid,
        totalInterest,
        totalPrincipal: totalPaid - totalInterest,
        monthlyBudget,
        strategy,
        schedule,
        order: orderIds,
      };
    }

    // No net progress this month means the fixed budget cannot beat the interest;
    // it never will, so stop now instead of looping to the cap.
    if (endingBalance >= startingBalance) {
      return {
        status: 'never',
        months: maxMonths,
        payoffDate: addMonths(input.startDate, maxMonths),
        totalPaid,
        totalInterest,
        totalPrincipal: totalPaid - totalInterest,
        monthlyBudget,
        strategy,
        schedule,
        order: orderIds,
        neverReason:
          'Your monthly amount does not cover the interest, so the balance never goes down. Raise the monthly amount to start making progress.',
      };
    }
  }

  // Hit the horizon cap without finishing.
  const finalBalance = sumMinor(tracked.map((d) => d.balance));
  return {
    status: 'never',
    months: maxMonths,
    payoffDate: addMonths(input.startDate, maxMonths),
    totalPaid,
    totalInterest,
    totalPrincipal: totalPaid - totalInterest,
    monthlyBudget,
    strategy,
    schedule,
    order: orderIds,
    neverReason:
      finalBalance > 0
        ? 'This plan takes longer than the projection horizon. Raise the monthly amount to bring the date into view.'
        : undefined,
  };
}

/** Sum of every debt's minimum payment, the floor a budget must clear to make progress. */
export function minimumsTotal(debts: readonly Debt[]): Minor {
  return sumMinor(debts.filter((d) => d.balance > 0).map((d) => Math.max(0, Math.round(d.minPayment))));
}
