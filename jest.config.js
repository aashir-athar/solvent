/** Jest config. Derives jest-expo's transform allowlist and adds @noble (ESM-only) to
 * it, so the crypto tests run without breaking expo-modules-core transformation. */
const expoPreset = require('jest-expo/jest-preset');

const base =
  (expoPreset.transformIgnorePatterns && expoPreset.transformIgnorePatterns[0]) || 'node_modules/';

module.exports = {
  ...expoPreset,
  testPathIgnorePatterns: ['/node_modules/', '/.expo/', '/android/', '/ios/'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  transformIgnorePatterns: [base.replace('node_modules/(?!', 'node_modules/(?!@noble/.*|')],
};
