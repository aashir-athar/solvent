// solvent-core: domain types shared across the engine.

import type { Minor } from './money';
import type { SolventDate } from './dates';

/** How extra money is allocated across debts once minimums are covered. */
export type DebtStrategy = 'avalanche' | 'snowball' | 'custom';

export interface Debt {
  id: string;
  name: string;
  /** Current amount owed, in integer minor units. */
  balance: Minor;
  /** Annual percentage rate as a percent, e.g. 19.99 means 19.99%. */
  apr: number;
  /** Required monthly minimum payment, in minor units. May be 0. */
  minPayment: Minor;
  /** For the 'custom' strategy: lower number is paid down first. Ignored otherwise. */
  priority?: number;
}

export interface SavingsTarget {
  id: string;
  name: string;
  /** The amount you are saving toward, in minor units. */
  target: Minor;
  /** Amount already saved, in minor units. */
  current: Minor;
  /** Annual percentage yield on the balance, as a percent. Defaults to 0. */
  apy?: number;
}

export type GoalKind = 'debt_free' | 'savings_target';

/** The terminal outcome of a projection. */
export type ProjectionStatus =
  | 'reached' // goal achieved within the horizon
  | 'never' // budget/contribution can never reach the goal
  | 'already'; // already at or past the goal at the start

/** One month of an amortization or savings schedule, all values in minor units. */
export interface MonthRow {
  index: number; // 1-based month number
  date: SolventDate;
  startingBalance: Minor;
  interest: Minor; // interest charged (debt) or yield earned (savings)
  applied: Minor; // payment applied (debt) or contribution added (savings)
  endingBalance: Minor;
}
