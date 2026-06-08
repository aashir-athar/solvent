// solvent-core: the deterministic savings-goal engine.
//
// Given a target amount, what is already saved, a monthly contribution, and an optional
// yield, it projects the exact date the balance reaches the target, with a full schedule.
// Same discipline as payoff: integer minor units, no system clock.

import type { Minor } from './money';
import { monthlyYield } from './money';
import type { SolventDate } from './dates';
import { addMonths } from './dates';
import type { MonthRow, ProjectionStatus } from './types';

export interface SavingsInput {
  /** Amount you are saving toward, in minor units. */
  target: Minor;
  /** Amount already saved, in minor units. */
  current: Minor;
  /** Amount added each month, in minor units. */
  monthlyContribution: Minor;
  /** Annual percentage yield as a percent. Defaults to 0. */
  apy?: number;
  startDate: SolventDate;
  maxMonths?: number;
}

export interface SavingsResult {
  status: ProjectionStatus;
  months: number;
  reachDate: SolventDate;
  totalContributed: Minor;
  totalYield: Minor;
  monthlyContribution: Minor;
  schedule: MonthRow[];
  neverReason?: string;
}

export function computeSavings(input: SavingsInput): SavingsResult {
  const maxMonths = input.maxMonths ?? 1200;
  const target = Math.max(0, Math.round(input.target));
  const contribution = Math.max(0, Math.round(input.monthlyContribution));
  const apy = input.apy ?? 0;
  let balance = Math.max(0, Math.round(input.current));

  if (balance >= target) {
    return {
      status: 'already',
      months: 0,
      reachDate: input.startDate,
      totalContributed: 0,
      totalYield: 0,
      monthlyContribution: contribution,
      schedule: [],
    };
  }

  if (contribution <= 0 && apy <= 0) {
    return {
      status: 'never',
      months: maxMonths,
      reachDate: addMonths(input.startDate, maxMonths),
      totalContributed: 0,
      totalYield: 0,
      monthlyContribution: contribution,
      schedule: [],
      neverReason: 'With no monthly contribution the balance stays flat. Add a monthly amount to set a date.',
    };
  }

  const schedule: MonthRow[] = [];
  let totalContributed = 0;
  let totalYield = 0;

  for (let month = 1; month <= maxMonths; month += 1) {
    const startingBalance = balance;
    const interest = monthlyYield(balance, apy);
    balance += interest + contribution;

    schedule.push({
      index: month,
      date: addMonths(input.startDate, month),
      startingBalance,
      interest,
      applied: contribution,
      endingBalance: balance,
    });
    totalContributed += contribution;
    totalYield += interest;

    if (balance >= target) {
      return {
        status: 'reached',
        months: month,
        reachDate: addMonths(input.startDate, month),
        totalContributed,
        totalYield,
        monthlyContribution: contribution,
        schedule,
      };
    }

    // Defensive: if a month adds nothing (contribution 0 and yield rounds to 0), stop.
    if (balance <= startingBalance) {
      return {
        status: 'never',
        months: maxMonths,
        reachDate: addMonths(input.startDate, maxMonths),
        totalContributed,
        totalYield,
        monthlyContribution: contribution,
        schedule,
        neverReason: 'The balance is not growing fast enough to reach the target. Add a monthly amount.',
      };
    }
  }

  return {
    status: 'never',
    months: maxMonths,
    reachDate: addMonths(input.startDate, maxMonths),
    totalContributed,
    totalYield,
    monthlyContribution: contribution,
    schedule,
    neverReason: 'This target takes longer than the projection horizon. Raise the monthly amount to bring the date into view.',
  };
}
