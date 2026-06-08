import {
  addMonths,
  clampDay,
  compareDates,
  daysInMonth,
  fromISO,
  makeDate,
  monthsBetween,
  toISO,
} from '../dates';

describe('dates', () => {
  test('daysInMonth handles leap years', () => {
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2023, 2)).toBe(28);
    expect(daysInMonth(2026, 4)).toBe(30);
    expect(daysInMonth(2026, 12)).toBe(31);
  });

  test('addMonths rolls across the year boundary', () => {
    expect(addMonths(makeDate(2026, 11, 15), 3)).toEqual(makeDate(2027, 2, 15));
    expect(addMonths(makeDate(2026, 1, 1), 12)).toEqual(makeDate(2027, 1, 1));
    expect(addMonths(makeDate(2026, 6, 10), 0)).toEqual(makeDate(2026, 6, 10));
  });

  test('addMonths clamps the day to the target month length', () => {
    expect(addMonths(makeDate(2024, 1, 31), 1)).toEqual(makeDate(2024, 2, 29)); // leap
    expect(addMonths(makeDate(2023, 1, 31), 1)).toEqual(makeDate(2023, 2, 28));
    expect(addMonths(makeDate(2026, 3, 31), 1)).toEqual(makeDate(2026, 4, 30));
  });

  test('clampDay keeps days in range', () => {
    expect(clampDay(2023, 2, 31)).toBe(28);
    expect(clampDay(2026, 6, 0)).toBe(1);
    expect(clampDay(2026, 6, 15)).toBe(15);
  });

  test('monthsBetween counts whole months', () => {
    expect(monthsBetween(makeDate(2026, 1, 1), makeDate(2028, 3, 1))).toBe(26);
    expect(monthsBetween(makeDate(2026, 5, 1), makeDate(2026, 5, 1))).toBe(0);
    expect(monthsBetween(makeDate(2027, 1, 1), makeDate(2026, 1, 1))).toBe(-12);
  });

  test('compareDates orders correctly', () => {
    expect(compareDates(makeDate(2026, 1, 1), makeDate(2026, 1, 2))).toBeLessThan(0);
    expect(compareDates(makeDate(2027, 1, 1), makeDate(2026, 12, 31))).toBeGreaterThan(0);
    expect(compareDates(makeDate(2026, 6, 6), makeDate(2026, 6, 6))).toBe(0);
  });

  test('ISO round-trips', () => {
    expect(toISO(makeDate(2028, 3, 14))).toBe('2028-03-14');
    expect(fromISO('2028-03-14')).toEqual(makeDate(2028, 3, 14));
    expect(toISO(makeDate(2026, 9, 2))).toBe('2026-09-02');
  });
});
