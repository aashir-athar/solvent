// Statement parser. Turns recognized or pasted statement text into candidate debts.
// Pure and unit-tested. It never writes to the ledger; every candidate is confirmed by
// the user first (the trust rule: OCR proposes, the human decides).

import { toMinor } from '@/core';

export interface OcrCandidate {
  name: string;
  balance: number; // minor units
  apr?: number; // percent
}

// Comma-grouped (1,234.56), decimal (1234.56), or plain integers of 2+ digits.
const AMOUNT_RE = /([0-9]{1,3}(?:,[0-9]{3})+(?:\.[0-9]{1,2})?|[0-9]+\.[0-9]{1,2}|[0-9]{2,})/g;
const APR_RE = /([0-9]{1,2}(?:\.[0-9]{1,2})?)\s*%/;
const NOISE_RE = /\b(rs|usd|pkr|inr|gbp|eur|apr|balance|bal|due|statement|minimum|min|payment|total|owed|card)\b/gi;

function parseAmount(raw: string): number {
  return Number.parseFloat(raw.replace(/,/g, ''));
}

function cleanName(raw: string): string {
  const name = raw
    .replace(AMOUNT_RE, ' ')
    .replace(/[$£€₹%*#:]/g, ' ')
    .replace(NOISE_RE, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return name.length >= 2 ? name.slice(0, 40) : 'Account';
}

/** Parse statement text into candidate debts. Heuristic by design; the user confirms. */
export function parseStatement(text: string): OcrCandidate[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const candidates: OcrCandidate[] = [];
  for (const line of lines) {
    const aprMatch = line.match(APR_RE);
    const apr = aprMatch ? clampApr(Number.parseFloat(aprMatch[1] ?? '')) : undefined;
    const withoutApr = aprMatch ? line.replace(aprMatch[0], ' ') : line;

    const amounts = [...withoutApr.matchAll(AMOUNT_RE)]
      .map((m) => parseAmount(m[1] ?? ''))
      .filter((n) => Number.isFinite(n) && n >= 10);
    if (amounts.length === 0) continue;

    const balanceMajor = Math.max(...amounts);
    candidates.push({ name: cleanName(withoutApr), balance: toMinor(balanceMajor), apr });
    if (candidates.length >= 20) break;
  }
  return candidates;
}

function clampApr(value: number): number | undefined {
  if (!Number.isFinite(value) || value < 0 || value > 200) return undefined;
  return value;
}
