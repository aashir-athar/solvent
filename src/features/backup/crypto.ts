// Backup encryption. AES-256-GCM with a key derived from the user's passphrase via
// PBKDF2-SHA256. Pure and dependency-light (@noble), so the encrypt/decrypt roundtrip is
// unit-tested. The output is a self-describing JSON envelope (salt + nonce + ciphertext,
// hex-encoded). No key, passphrase, or plaintext is ever stored or transmitted.
//
// Requires crypto.getRandomValues. The app polyfills it via react-native-get-random-values
// (imported in app/_layout.tsx); Node provides it natively for tests.

import { gcm } from '@noble/ciphers/aes.js';
import { bytesToHex, bytesToUtf8, hexToBytes, randomBytes, utf8ToBytes } from '@noble/ciphers/utils.js';
import { pbkdf2 } from '@noble/hashes/pbkdf2.js';
import { sha256 } from '@noble/hashes/sha2.js';

const ITERATIONS = 150_000;

export interface BackupEnvelope {
  v: 1;
  kdf: 'pbkdf2-sha256';
  iter: number;
  salt: string;
  nonce: string;
  ct: string;
}

function deriveKey(passphrase: string, salt: Uint8Array): Uint8Array {
  return pbkdf2(sha256, passphrase, salt, { c: ITERATIONS, dkLen: 32 });
}

export function encryptString(plaintext: string, passphrase: string): string {
  const salt = randomBytes(16);
  const nonce = randomBytes(12);
  const key = deriveKey(passphrase, salt);
  const ct = gcm(key, nonce).encrypt(utf8ToBytes(plaintext));
  const envelope: BackupEnvelope = {
    v: 1,
    kdf: 'pbkdf2-sha256',
    iter: ITERATIONS,
    salt: bytesToHex(salt),
    nonce: bytesToHex(nonce),
    ct: bytesToHex(ct),
  };
  return JSON.stringify(envelope);
}

export function decryptString(envelopeJson: string, passphrase: string): string {
  let envelope: BackupEnvelope;
  try {
    envelope = JSON.parse(envelopeJson) as BackupEnvelope;
  } catch {
    throw new Error('This file is not a Solvent backup.');
  }
  if (envelope.v !== 1 || !envelope.salt || !envelope.nonce || !envelope.ct) {
    throw new Error('This file is not a Solvent backup.');
  }
  const key = deriveKey(passphrase, hexToBytes(envelope.salt));
  // Throws on a wrong passphrase or tampered file (GCM authentication tag mismatch).
  const plaintext = gcm(key, hexToBytes(envelope.nonce)).decrypt(hexToBytes(envelope.ct));
  return bytesToUtf8(plaintext);
}
