import { computeSavings } from '../savings';
import { addMonths, makeDate } from '../dates';

const START = makeDate(2026, 1, 1);

describe('computeSavings', () => {
  test('zero-yield goal reaches target in exact months', () => {
    const r = computeSavings({ target: 120000, current: 0, monthlyContribution: 10000, startDate: START });
    expect(r.status).toBe('reached');
    expect(r.months).toBe(12);
    expect(r.reachDate).toEqual(addMonths(START, 12));
    expect(r.totalContributed).toBe(120000);
    expect(r.totalYield).toBe(0);
    expect(r.schedule).toHaveLength(12);
  });

  test('already-saved goal returns already', () => {
    const r = computeSavings({ target: 100000, current: 150000, monthlyContribution: 10000, startDate: START });
    expect(r.status).toBe('already');
    expect(r.months).toBe(0);
    expect(r.reachDate).toEqual(START);
  });

  test('no contribution and no yield never reaches', () => {
    const r = computeSavings({ target: 100000, current: 0, monthlyContribution: 0, startDate: START });
    expect(r.status).toBe('never');
    expect(r.neverReason).toMatch(/monthly/i);
  });

  test('yield brings the date forward, never later', () => {
    const withYield = computeSavings({ target: 120000, current: 0, monthlyContribution: 10000, apy: 12, startDate: START });
    expect(withYield.status).toBe('reached');
    expect(withYield.months).toBeLessThanOrEqual(12);
    expect(withYield.totalYield).toBeGreaterThan(0);
  });

  test('partial starting balance shortens the timeline', () => {
    const r = computeSavings({ target: 120000, current: 60000, monthlyContribution: 10000, startDate: START });
    expect(r.status).toBe('reached');
    expect(r.months).toBe(6);
  });
});
