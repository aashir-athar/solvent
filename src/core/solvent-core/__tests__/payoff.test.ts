import { computePayoff, minimumsTotal, type PayoffInput } from '../payoff';
import { addMonths, makeDate } from '../dates';
import type { Debt } from '../types';

const START = makeDate(2026, 1, 1);

function debt(id: string, balance: number, apr: number, minPayment: number, priority?: number): Debt {
  return { id, name: id.toUpperCase(), balance, apr, minPayment, priority };
}

describe('computePayoff: golden cases (hand-verifiable)', () => {
  test('zero-interest debt pays off in exact months', () => {
    const input: PayoffInput = {
      debts: [debt('a', 120000, 0, 10000)],
      monthlyBudget: 10000,
      strategy: 'avalanche',
      startDate: START,
    };
    const r = computePayoff(input);
    expect(r.status).toBe('reached');
    expect(r.months).toBe(12);
    expect(r.payoffDate).toEqual(addMonths(START, 12));
    expect(r.totalInterest).toBe(0);
    expect(r.totalPaid).toBe(120000);
    expect(r.totalPrincipal).toBe(120000);
    expect(r.schedule).toHaveLength(12);
    expect(r.schedule[11]!.endingBalance).toBe(0);
  });

  test('zero-interest debt with a larger budget finishes early and only pays what is owed', () => {
    const r = computePayoff({
      debts: [debt('a', 100000, 0, 30000)],
      monthlyBudget: 30000,
      strategy: 'avalanche',
      startDate: START,
    });
    expect(r.status).toBe('reached');
    expect(r.months).toBe(4); // 300, 300, 300, 100
    expect(r.totalPaid).toBe(100000);
    expect(r.schedule[3]!.applied).toBe(10000); // last month only pays the remaining $100
  });

  test('a budget that only covers interest never pays off', () => {
    const r = computePayoff({
      debts: [debt('a', 100000, 24, 2000)],
      monthlyBudget: 2000, // 2% of $1000 = $20 interest, exactly the budget
      strategy: 'avalanche',
      startDate: START,
    });
    expect(r.status).toBe('never');
    expect(r.neverReason).toMatch(/does not cover the interest/i);
  });

  test('no debts means already debt-free', () => {
    const r = computePayoff({
      debts: [],
      monthlyBudget: 50000,
      strategy: 'avalanche',
      startDate: START,
    });
    expect(r.status).toBe('already');
    expect(r.months).toBe(0);
    expect(r.payoffDate).toEqual(START);
    expect(r.schedule).toHaveLength(0);
  });

  test('debts with zero balance are ignored', () => {
    const r = computePayoff({
      debts: [debt('a', 0, 20, 0), debt('b', 50000, 0, 5000)],
      monthlyBudget: 5000,
      strategy: 'avalanche',
      startDate: START,
    });
    expect(r.status).toBe('reached');
    expect(r.months).toBe(10);
    expect(r.order).toEqual(['b']);
  });
});

describe('computePayoff: strategy ordering', () => {
  const debts = [debt('high', 100000, 30, 2000), debt('low', 50000, 10, 2000)];

  test('avalanche targets the highest APR first', () => {
    const r = computePayoff({ debts, monthlyBudget: 10000, strategy: 'avalanche', startDate: START });
    expect(r.order[0]).toBe('high');
  });

  test('snowball targets the smallest balance first', () => {
    const r = computePayoff({ debts, monthlyBudget: 10000, strategy: 'snowball', startDate: START });
    expect(r.order[0]).toBe('low');
  });

  test('custom follows the provided priority', () => {
    const custom = [debt('x', 100000, 30, 2000, 2), debt('y', 50000, 10, 2000, 1)];
    const r = computePayoff({ debts: custom, monthlyBudget: 10000, strategy: 'custom', startDate: START });
    expect(r.order).toEqual(['y', 'x']);
  });

  test('avalanche never costs more interest than snowball', () => {
    const av = computePayoff({ debts, monthlyBudget: 10000, strategy: 'avalanche', startDate: START });
    const sn = computePayoff({ debts, monthlyBudget: 10000, strategy: 'snowball', startDate: START });
    expect(av.status).toBe('reached');
    expect(sn.status).toBe('reached');
    expect(av.totalInterest).toBeLessThanOrEqual(sn.totalInterest);
  });
});

describe('computePayoff: invariants', () => {
  test('minimumsTotal sums active minimums', () => {
    expect(minimumsTotal([debt('a', 100, 0, 2500), debt('b', 0, 0, 9999), debt('c', 100, 0, 1500)])).toBe(4000);
  });

  test('is deterministic', () => {
    const input: PayoffInput = {
      debts: [debt('a', 530000, 22.9, 12000), debt('b', 180000, 14.5, 5000)],
      monthlyBudget: 40000,
      strategy: 'avalanche',
      startDate: START,
    };
    expect(computePayoff(input)).toEqual(computePayoff(input));
  });
});

// Seeded linear-congruential PRNG so any property-test failure is reproducible.
function makeRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

describe('computePayoff: property tests (1000 reproducible random cases)', () => {
  test('principal conserved and schedule well-formed for every reached plan', () => {
    const rng = makeRng(0x50_4f_46_46); // "POFF"
    let reachedCount = 0;

    for (let i = 0; i < 1000; i += 1) {
      const debtCount = 1 + Math.floor(rng() * 4);
      const debts: Debt[] = [];
      for (let d = 0; d < debtCount; d += 1) {
        const balance = 5000 + Math.floor(rng() * 1_500_000); // $50 .. $15,000
        const apr = Math.floor(rng() * 3500) / 100; // 0% .. 35%
        const minPayment = 1000 + Math.floor(rng() * 20000); // $10 .. $210
        debts.push(debt(`d${d}`, balance, apr, minPayment));
      }
      const initialPrincipal = debts.reduce((sum, x) => sum + x.balance, 0);
      // A budget generous enough that most cases reach payoff.
      const budget = debts.reduce((s, x) => s + x.minPayment, 0) + 5000 + Math.floor(rng() * 200000);
      const strategy = (['avalanche', 'snowball', 'custom'] as const)[Math.floor(rng() * 3)]!;

      const r = computePayoff({ debts, monthlyBudget: budget, strategy, startDate: START });

      if (r.status !== 'reached') continue;
      reachedCount += 1;

      // Principal conservation: everything paid minus all interest equals the original debt.
      expect(r.totalPrincipal).toBe(initialPrincipal);
      expect(r.totalPaid - r.totalInterest).toBe(initialPrincipal);

      // Schedule shape.
      expect(r.schedule).toHaveLength(r.months);
      expect(r.payoffDate).toEqual(addMonths(START, r.months));
      expect(r.schedule[r.schedule.length - 1]!.endingBalance).toBe(0);

      // Ending balance is monotonically non-increasing across the schedule.
      for (let m = 1; m < r.schedule.length; m += 1) {
        expect(r.schedule[m]!.endingBalance).toBeLessThanOrEqual(r.schedule[m - 1]!.endingBalance);
      }
    }

    expect(reachedCount).toBeGreaterThan(900); // sanity: the generator mostly produces solvable cases
  });
});
