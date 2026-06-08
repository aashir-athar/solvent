// solvent-core: money primitives.
// Money is stored as integer minor units (cents, paisa, kobo, etc.) so the engine
// never performs floating-point arithmetic on stored balances. A wrong number in a
// money app is trust-fatal, so every value that lands in the ledger is an integer.

/** Integer minor units. Always a whole number (cents, paisa, ...). */
export type Minor = number;

export function isMinor(value: number): boolean {
  return Number.isInteger(value);
}

/** Build minor units from a major amount (e.g. 19.99 -> 1999). Rounds to the nearest unit. */
export function toMinor(major: number, unitsPerMajor = 100): Minor {
  return Math.round(major * unitsPerMajor);
}

/** Convert minor units back to a major float for display formatting (e.g. 1999 -> 19.99). */
export function toMajor(minor: Minor, unitsPerMajor = 100): number {
  return minor / unitsPerMajor;
}

/** Clamp a value to a non-negative integer minor amount. */
export function clampMinor(value: number): Minor {
  return value < 0 ? 0 : Math.round(value);
}

/**
 * Monthly interest on a balance for a given APR (annual percentage rate, in percent,
 * e.g. 19.99). Returns an integer minor amount. Uses simple monthly compounding:
 * monthlyRate = apr / 100 / 12. Negative or zero APR yields zero interest.
 */
export function monthlyInterest(balance: Minor, apr: number): Minor {
  if (apr <= 0 || balance <= 0) return 0;
  const monthlyRate = apr / 100 / 12;
  return Math.round(balance * monthlyRate);
}

/**
 * Monthly growth on a savings balance for a given APY (annual percentage yield, in
 * percent). Same shape as monthlyInterest but named for the savings domain.
 */
export function monthlyYield(balance: Minor, apy: number): Minor {
  if (apy <= 0 || balance <= 0) return 0;
  const monthlyRate = apy / 100 / 12;
  return Math.round(balance * monthlyRate);
}

/** Sum a list of minor amounts. */
export function sumMinor(values: readonly Minor[]): Minor {
  let total = 0;
  for (const v of values) total += v;
  return total;
}
