import { clampMinor, isMinor, monthlyInterest, monthlyYield, sumMinor, toMajor, toMinor } from '../money';

describe('money', () => {
  test('toMinor / toMajor round-trip', () => {
    expect(toMinor(19.99)).toBe(1999);
    expect(toMinor(0)).toBe(0);
    expect(toMinor(1000)).toBe(100000);
    expect(toMajor(1999)).toBeCloseTo(19.99, 5);
  });

  test('toMinor rounds to the nearest unit', () => {
    expect(toMinor(19.999)).toBe(2000);
    expect(toMinor(19.994)).toBe(1999);
    expect(isMinor(toMinor(123.456))).toBe(true);
  });

  test('monthlyInterest uses apr/12 and rounds to an integer', () => {
    expect(monthlyInterest(100000, 12)).toBe(1000); // 1% of $1000 = $10
    expect(monthlyInterest(100000, 19.99)).toBe(Math.round(100000 * (19.99 / 100 / 12)));
    expect(monthlyInterest(100000, 0)).toBe(0);
    expect(monthlyInterest(0, 24)).toBe(0);
    expect(monthlyInterest(100000, -5)).toBe(0);
  });

  test('monthlyYield mirrors interest for savings', () => {
    expect(monthlyYield(120000, 6)).toBe(Math.round(120000 * (6 / 100 / 12)));
    expect(monthlyYield(120000, 0)).toBe(0);
  });

  test('helpers', () => {
    expect(sumMinor([100, 200, 300])).toBe(600);
    expect(sumMinor([])).toBe(0);
    expect(clampMinor(-50)).toBe(0);
    expect(clampMinor(49.6)).toBe(50);
  });
});
