import { decryptString, encryptString } from '../crypto';

describe('backup crypto (AES-256-GCM + PBKDF2)', () => {
  test('roundtrips a payload with the right passphrase', () => {
    const plaintext = JSON.stringify({ debts: [{ name: 'Card', balance: 100000 }], n: 42 });
    const envelope = encryptString(plaintext, 'correct horse battery staple');
    expect(decryptString(envelope, 'correct horse battery staple')).toBe(plaintext);
  });

  test('a wrong passphrase throws', () => {
    const envelope = encryptString('secret', 'right-passphrase');
    expect(() => decryptString(envelope, 'wrong-passphrase')).toThrow();
  });

  test('a tampered ciphertext throws', () => {
    const envelope = JSON.parse(encryptString('secret', 'p')) as { ct: string };
    envelope.ct = envelope.ct.slice(0, -2) + (envelope.ct.endsWith('00') ? '11' : '00');
    expect(() => decryptString(JSON.stringify(envelope), 'p')).toThrow();
  });

  test('a non-backup file throws a friendly error', () => {
    expect(() => decryptString('this is not json', 'p')).toThrow(/not a Solvent backup/i);
  });

  test('the same input encrypts differently each time (random salt + nonce)', () => {
    const a = encryptString('x', 'p');
    const b = encryptString('x', 'p');
    expect(a).not.toBe(b);
  });
});
