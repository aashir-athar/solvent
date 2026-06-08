// solvent-core: the open, auditable money-math engine behind Solvent.
//
// Deterministic. Dependency-free. Integer minor units throughout. No system clock inside.
// Give it your balances; it gives you the exact date you are free, and shows its work.
//
// MIT licensed. Audit it, fork it, verify that the numbers and the privacy promise hold.

export const SOLVENT_CORE_VERSION = '1.0.0';

export type { Minor } from './money';
export {
  isMinor,
  toMinor,
  toMajor,
  clampMinor,
  monthlyInterest,
  monthlyYield,
  sumMinor,
} from './money';

export type { SolventDate } from './dates';
export {
  makeDate,
  daysInMonth,
  clampDay,
  addMonths,
  compareDates,
  monthsBetween,
  toISO,
  fromISO,
  fromJSDate,
} from './dates';

export type {
  Debt,
  SavingsTarget,
  DebtStrategy,
  GoalKind,
  ProjectionStatus,
  MonthRow,
} from './types';

export type { PayoffInput, PayoffResult } from './payoff';
export { computePayoff, minimumsTotal } from './payoff';

export type { SavingsInput, SavingsResult } from './savings';
export { computeSavings } from './savings';

export type { Plan, PlanRequest, WhatIfResult } from './plan';
export { computePlan, whatIf } from './plan';
