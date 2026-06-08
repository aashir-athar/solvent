// Debts store. SQLite is the persistence; this store is the in-memory reactive source
// the screens read, kept in sync after every write so the home date recomputes live.

import { create } from 'zustand';
import {
  deleteDebt,
  insertDebt,
  listDebts,
  updateDebt,
  type DebtInput,
  type DebtRecord,
} from '@/db/debtsRepo';
import { errorReporter } from '@/lib/errorReporter';

interface DebtsState {
  debts: DebtRecord[];
  loading: boolean;
  loaded: boolean;
  load: () => Promise<void>;
  add: (input: DebtInput) => Promise<void>;
  update: (id: string, input: DebtInput) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useDebtsStore = create<DebtsState>((set, get) => ({
  debts: [],
  loading: false,
  loaded: false,
  load: async () => {
    set({ loading: true });
    try {
      const debts = await listDebts();
      set({ debts, loaded: true });
    } catch (error) {
      errorReporter.captureError(error, { scope: 'debts.load' });
    } finally {
      set({ loading: false });
    }
  },
  add: async (input) => {
    const record = await insertDebt(input);
    set({ debts: [...get().debts, record] });
  },
  update: async (id, input) => {
    await updateDebt(id, input);
    set({
      debts: get().debts.map((d) => (d.id === id ? { ...d, ...input, updatedAt: Date.now() } : d)),
    });
  },
  remove: async (id) => {
    await deleteDebt(id);
    set({ debts: get().debts.filter((d) => d.id !== id) });
  },
}));
