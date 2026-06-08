import { parseStatement } from '../parser';

describe('parseStatement', () => {
  test('extracts a balance and APR from a statement line', () => {
    const result = parseStatement('Visa ****1234   4,210.55   19.99% APR');
    expect(result).toHaveLength(1);
    expect(result[0]!.balance).toBe(421055);
    expect(result[0]!.apr).toBeCloseTo(19.99, 2);
    expect(result[0]!.name.toLowerCase()).toContain('visa');
  });

  test('does not treat the APR percentage as the balance', () => {
    const result = parseStatement('Store Card  900.00  24.99%');
    expect(result[0]!.balance).toBe(90000);
    expect(result[0]!.apr).toBeCloseTo(24.99, 2);
  });

  test('parses multiple accounts across lines', () => {
    const text = ['Chase Freedom 5,400.00 22.9%', 'Auto loan 12,300 6.5%', 'Header with no numbers'].join('\n');
    const result = parseStatement(text);
    expect(result).toHaveLength(2);
    expect(result[1]!.balance).toBe(1230000);
  });

  test('skips lines without a real amount', () => {
    expect(parseStatement('Account summary\nThank you for banking with us')).toHaveLength(0);
  });

  test('falls back to a generic name when none is present', () => {
    const result = parseStatement('1,000.00');
    expect(result[0]!.name).toBe('Account');
    expect(result[0]!.balance).toBe(100000);
  });

  test('ignores tiny numbers that are not balances', () => {
    expect(parseStatement('Page 1 of 3')).toHaveLength(0);
  });
});
