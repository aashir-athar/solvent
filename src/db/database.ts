// Local SQLite store. The financial ledger lives here, on the device, and nowhere else.
// Opened once and migrated on first access.

import * as SQLite from 'expo-sqlite';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function init(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync('solvent.db');
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS debts (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      balance INTEGER NOT NULL,
      apr REAL NOT NULL,
      min_payment INTEGER NOT NULL,
      priority INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);
  return db;
}

export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) dbPromise = init();
  return dbPromise;
}

/** Wipe every record. Used by the privacy "erase everything" action. */
export async function eraseAllData(): Promise<void> {
  const db = await getDb();
  await db.execAsync('DELETE FROM debts;');
}
