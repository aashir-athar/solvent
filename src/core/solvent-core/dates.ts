// solvent-core: pure calendar arithmetic.
// The engine never reads the system clock. The caller passes an anchor date
// (usually "today") and the engine projects forward deterministically, so the same
// inputs always produce the same date. That reproducibility is the whole trust model.

/** A plain calendar date. month is 1-12, day is 1-31. */
export interface SolventDate {
  year: number;
  month: number;
  day: number;
}

export function makeDate(year: number, month: number, day: number): SolventDate {
  return { year, month, day };
}

export function daysInMonth(year: number, month: number): number {
  // month is 1-12; new Date(year, month, 0) is the last day of the 1-indexed month.
  return new Date(year, month, 0).getDate();
}

export function clampDay(year: number, month: number, day: number): number {
  const max = daysInMonth(year, month);
  if (day < 1) return 1;
  return day > max ? max : day;
}

/**
 * Add a whole number of months to a date. The day is preserved where possible and
 * clamped to the target month's length (e.g. Jan 31 + 1 month = Feb 28/29).
 */
export function addMonths(date: SolventDate, months: number): SolventDate {
  const zeroBased = date.month - 1 + months;
  const year = date.year + Math.floor(zeroBased / 12);
  const month = ((zeroBased % 12) + 12) % 12 + 1;
  const day = clampDay(year, month, date.day);
  return { year, month, day };
}

export function compareDates(a: SolventDate, b: SolventDate): number {
  if (a.year !== b.year) return a.year - b.year;
  if (a.month !== b.month) return a.month - b.month;
  return a.day - b.day;
}

/** Whole months from a to b (b - a), ignoring day-of-month. Negative if b precedes a. */
export function monthsBetween(a: SolventDate, b: SolventDate): number {
  return (b.year - a.year) * 12 + (b.month - a.month);
}

export function toISO(date: SolventDate): string {
  const mm = String(date.month).padStart(2, '0');
  const dd = String(date.day).padStart(2, '0');
  return `${date.year}-${mm}-${dd}`;
}

export function fromISO(iso: string): SolventDate {
  const [y, m, d] = iso.split('-').map((part) => Number.parseInt(part, 10));
  return { year: y ?? 1970, month: m ?? 1, day: d ?? 1 };
}

/** Convert a JS Date to a SolventDate. The ONE place a real clock value may enter, at the app boundary. */
export function fromJSDate(jsDate: Date): SolventDate {
  return { year: jsDate.getFullYear(), month: jsDate.getMonth() + 1, day: jsDate.getDate() };
}
