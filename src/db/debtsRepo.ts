// Debts repository. Thin, typed CRUD over the local SQLite table.

import { getDb } from './database';
import { makeId } from '@/lib/id';

export interface DebtRecord {
  id: string;
  name: string;
  balance: number; // minor units
  apr: number; // percent
  minPayment: number; // minor units
  priority: number;
  createdAt: number;
  updatedAt: number;
}

export interface DebtInput {
  name: string;
  balance: number;
  apr: number;
  minPayment: number;
  priority?: number;
}

interface DebtRowRaw {
  id: string;
  name: string;
  balance: number;
  apr: number;
  min_payment: number;
  priority: number;
  created_at: number;
  updated_at: number;
}

const fromRaw = (r: DebtRowRaw): DebtRecord => ({
  id: r.id,
  name: r.name,
  balance: r.balance,
  apr: r.apr,
  minPayment: r.min_payment,
  priority: r.priority,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export async function listDebts(): Promise<DebtRecord[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<DebtRowRaw>('SELECT * FROM debts ORDER BY priority ASC, created_at ASC');
  return rows.map(fromRaw);
}

export async function insertDebt(input: DebtInput): Promise<DebtRecord> {
  const db = await getDb();
  const now = Date.now();
  const id = makeId('debt');
  const priority = input.priority ?? now;
  await db.runAsync(
    'INSERT INTO debts (id, name, balance, apr, min_payment, priority, created_at, updated_at) VALUES ($id, $name, $balance, $apr, $min, $priority, $created, $updated)',
    {
      $id: id,
      $name: input.name,
      $balance: input.balance,
      $apr: input.apr,
      $min: input.minPayment,
      $priority: priority,
      $created: now,
      $updated: now,
    },
  );
  return {
    id,
    name: input.name,
    balance: input.balance,
    apr: input.apr,
    minPayment: input.minPayment,
    priority,
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateDebt(id: string, input: DebtInput): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE debts SET name = $name, balance = $balance, apr = $apr, min_payment = $min, updated_at = $updated WHERE id = $id',
    {
      $id: id,
      $name: input.name,
      $balance: input.balance,
      $apr: input.apr,
      $min: input.minPayment,
      $updated: Date.now(),
    },
  );
}

export async function deleteDebt(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM debts WHERE id = $id', { $id: id });
}
