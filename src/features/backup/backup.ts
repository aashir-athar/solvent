// Encrypted backup orchestration. Export gathers the local ledger + settings, encrypts
// them with the user's passphrase, and hands the file to the share sheet (the user saves
// it wherever they like; Solvent never uploads it). Import reverses the flow.
//
// This is the honest, on-device realization of "optional encrypted backup": there is no
// server, so nothing leaves the device unless the user explicitly exports the encrypted
// file. A realtime CRDT sync backend (PowerSync) is the documented production upgrade.

import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { decryptString, encryptString } from './crypto';
import { insertDebt, listDebts } from '@/db/debtsRepo';
import { eraseAllData } from '@/db/database';
import { useDebtsStore } from '@/stores/useDebtsStore';
import { useSettingsStore, type BaselineSnapshot, type SavingsGoalState } from '@/stores/useSettingsStore';
import type { DebtStrategy, GoalKind } from '@/core';

interface BackupSettings {
  currency: string;
  locale?: string;
  goalKind: GoalKind;
  strategy: DebtStrategy;
  extraPerMonth: number;
  paymentDay: number;
  savings: SavingsGoalState;
  backupOptIn: boolean;
  nudgeEnabled: boolean;
  baseline: BaselineSnapshot | null;
}

interface BackupPayload {
  v: 1;
  createdAt: number;
  debts: Array<{ name: string; balance: number; apr: number; minPayment: number; priority: number }>;
  settings: BackupSettings;
}

export async function exportEncryptedBackup(passphrase: string): Promise<void> {
  const debts = await listDebts();
  const s = useSettingsStore.getState();
  const payload: BackupPayload = {
    v: 1,
    createdAt: Date.now(),
    debts: debts.map((d) => ({
      name: d.name,
      balance: d.balance,
      apr: d.apr,
      minPayment: d.minPayment,
      priority: d.priority,
    })),
    settings: {
      currency: s.currency,
      locale: s.locale,
      goalKind: s.goalKind,
      strategy: s.strategy,
      extraPerMonth: s.extraPerMonth,
      paymentDay: s.paymentDay,
      savings: s.savings,
      backupOptIn: s.backupOptIn,
      nudgeEnabled: s.nudgeEnabled,
      baseline: s.baseline,
    },
  };

  const encrypted = encryptString(JSON.stringify(payload), passphrase);
  const uri = `${FileSystem.cacheDirectory ?? ''}solvent-backup.solvent`;
  await FileSystem.writeAsStringAsync(uri, encrypted, { encoding: FileSystem.EncodingType.UTF8 });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: 'application/json', dialogTitle: 'Save your Solvent backup' });
  }
}

export type ImportResult = 'imported' | 'cancelled';

export async function importEncryptedBackup(passphrase: string): Promise<ImportResult> {
  const picked = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
  if (picked.canceled) return 'cancelled';
  const uri = picked.assets[0]?.uri;
  if (!uri) return 'cancelled';

  const content = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.UTF8 });
  const json = decryptString(content, passphrase); // throws on a wrong passphrase or tampered file
  const payload = JSON.parse(json) as BackupPayload;
  if (payload.v !== 1 || !Array.isArray(payload.debts)) {
    throw new Error('This backup could not be read.');
  }

  await eraseAllData();
  for (const d of payload.debts) {
    await insertDebt({ name: d.name, balance: d.balance, apr: d.apr, minPayment: d.minPayment, priority: d.priority });
  }
  await useDebtsStore.getState().load();
  useSettingsStore.setState({ ...payload.settings, hasOnboarded: true });
  return 'imported';
}
