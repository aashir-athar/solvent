import { computePlan, whatIf } from '../plan';
import { addMonths, makeDate } from '../dates';
import type { Debt } from '../types';

const START = makeDate(2026, 1, 1);
const debts: Debt[] = [{ id: 'a', name: 'A', balance: 120000, apr: 0, minPayment: 10000 }];

describe('computePlan', () => {
  test('maps a debt payoff into a Plan', () => {
    const plan = computePlan({
      kind: 'debt_free',
      payoff: { debts, monthlyBudget: 10000, strategy: 'avalanche', startDate: START },
    });
    expect(plan.kind).toBe('debt_free');
    expect(plan.status).toBe('reached');
    expect(plan.months).toBe(12);
    expect(plan.date).toEqual(addMonths(START, 12));
    expect(plan.strategy).toBe('avalanche');
    expect(plan.totalApplied).toBe(120000);
  });

  test('maps a savings target into a Plan', () => {
    const plan = computePlan({
      kind: 'savings_target',
      savings: { target: 120000, current: 0, monthlyContribution: 10000, startDate: START },
    });
    expect(plan.kind).toBe('savings_target');
    expect(plan.status).toBe('reached');
    expect(plan.months).toBe(12);
    expect(plan.strategy).toBeUndefined();
  });
});

describe('whatIf', () => {
  test('extra payment pulls the debt-free date closer', () => {
    const result = whatIf(
      { kind: 'debt_free', payoff: { debts, monthlyBudget: 10000, strategy: 'avalanche', startDate: START } },
      10000,
    );
    expect(result.baseMonths).toBe(12);
    expect(result.newMonths).toBe(6);
    expect(result.monthsSooner).toBe(6);
    expect(result.newDate).toEqual(addMonths(START, 6));
    expect(result.interestSaved).toBe(0); // zero-interest case
  });

  test('extra contribution pulls a savings date closer', () => {
    const result = whatIf(
      {
        kind: 'savings_target',
        savings: { target: 120000, current: 0, monthlyContribution: 10000, startDate: START },
      },
      10000,
    );
    expect(result.baseMonths).toBe(12);
    expect(result.newMonths).toBe(6);
    expect(result.monthsSooner).toBe(6);
  });

  test('extra payment saves interest on an interest-bearing debt', () => {
    const interestDebts: Debt[] = [{ id: 'cc', name: 'Card', balance: 500000, apr: 22.9, minPayment: 12000 }];
    const result = whatIf(
      { kind: 'debt_free', payoff: { debts: interestDebts, monthlyBudget: 15000, strategy: 'avalanche', startDate: START } },
      10000,
    );
    expect(result.monthsSooner).toBeGreaterThan(0);
    expect(result.interestSaved).toBeGreaterThan(0);
  });
});
