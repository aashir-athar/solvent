// Display formatting. The engine works in integer minor units; these helpers turn
// those into locale-aware strings at the very edge, for the UI only.

import { toMajor, type SolventDate } from '@/core';
import { translate } from '@/i18n';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

/** "14 March 2028", the hero date. */
export function formatLongDate(date: SolventDate): string {
  return `${date.day} ${MONTHS[date.month - 1]} ${date.year}`;
}

/** "Mar 2028", compact for schedule rows. */
export function formatMonthYear(date: SolventDate): string {
  return `${MONTHS_SHORT[date.month - 1]} ${date.year}`;
}

/** Money from minor units, e.g. (123456, 'USD') -> "$1,234.56". Falls back gracefully. */
export function formatMoney(minor: number, currency: string, locale?: string): string {
  const major = toMajor(minor);
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(major);
  } catch {
    return `${currency} ${major.toFixed(2)}`;
  }
}

/** Whole-dollar money for tight UI, e.g. "$1,235". */
export function formatMoneyShort(minor: number, currency: string, locale?: string): string {
  const major = toMajor(minor);
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(major);
  } catch {
    return `${currency} ${Math.round(major)}`;
  }
}

/** A plain decimal amount for monospace tables, e.g. (123456) -> "1,234.56". No symbol. */
export function formatDecimal(minor: number, locale?: string): string {
  try {
    return new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(toMajor(minor));
  } catch {
    return toMajor(minor).toFixed(2);
  }
}

/** The currency symbol for a code, e.g. ('USD') -> "$", ('PKR') -> "Rs". Falls back to the code. */
export function currencySymbol(currency: string, locale?: string): string {
  try {
    const parts = new Intl.NumberFormat(locale, { style: 'currency', currency }).formatToParts(0);
    return parts.find((p) => p.type === 'currency')?.value ?? currency;
  } catch {
    return currency;
  }
}

/** "2 years, 3 months", "11 months", "1 month". */
export function formatDuration(totalMonths: number): string {
  if (totalMonths <= 0) return translate('time.now');
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(translate(years === 1 ? 'time.year' : 'time.years', { n: years }));
  if (months > 0) parts.push(translate(months === 1 ? 'time.month' : 'time.months', { n: months }));
  return parts.join(', ');
}

/** "7 months sooner", "1 month sooner", "the same date". */
export function formatSooner(months: number): string {
  if (months <= 0) return translate('time.sameDate');
  return translate(months === 1 ? 'time.monthSooner' : 'time.monthsSooner', { n: months });
}
