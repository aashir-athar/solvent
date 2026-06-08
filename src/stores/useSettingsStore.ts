// Settings: the singletons that shape the date (goal kind, strategy, monthly extra,
// currency) plus the privacy backup flag. Persisted via AsyncStorage, never MMKV.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DebtStrategy, GoalKind } from '@/core';

export interface SavingsGoalState {
  name: string;
  target: number; // minor units
  current: number; // minor units
  monthlyContribution: number; // minor units
  apy: number; // percent
}

/** The first reached projection, captured once, so we can show honest progress later. */
export interface BaselineSnapshot {
  months: number;
  dateISO: string;
  setAt: number;
}

interface SettingsState {
  hasOnboarded: boolean;
  currency: string;
  locale?: string;
  goalKind: GoalKind;
  strategy: DebtStrategy;
  extraPerMonth: number; // minor units, on top of minimum payments
  paymentDay: number; // 1-28, the day the date lands on
  savings: SavingsGoalState;
  backupOptIn: boolean;
  nudgeEnabled: boolean;
  baseline: BaselineSnapshot | null;
  hydrated: boolean;
  setHasOnboarded: (value: boolean) => void;
  setCurrency: (value: string) => void;
  setLocale: (value: string | undefined) => void;
  setGoalKind: (value: GoalKind) => void;
  setStrategy: (value: DebtStrategy) => void;
  setExtraPerMonth: (value: number) => void;
  setPaymentDay: (value: number) => void;
  setSavings: (value: Partial<SavingsGoalState>) => void;
  setBackupOptIn: (value: boolean) => void;
  setNudgeEnabled: (value: boolean) => void;
  setBaseline: (value: BaselineSnapshot | null) => void;
  resetAll: () => void;
}

const defaults = {
  hasOnboarded: false,
  currency: 'USD',
  locale: undefined as string | undefined,
  goalKind: 'debt_free' as GoalKind,
  strategy: 'avalanche' as DebtStrategy,
  extraPerMonth: 0,
  paymentDay: 1,
  savings: { name: 'My savings goal', target: 0, current: 0, monthlyContribution: 0, apy: 0 } as SavingsGoalState,
  backupOptIn: false,
  nudgeEnabled: false,
  baseline: null as BaselineSnapshot | null,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...defaults,
      hydrated: false,
      setHasOnboarded: (hasOnboarded) => set({ hasOnboarded }),
      setCurrency: (currency) => set({ currency }),
      setLocale: (locale) => set({ locale }),
      setGoalKind: (goalKind) => set({ goalKind }),
      setStrategy: (strategy) => set({ strategy }),
      setExtraPerMonth: (extraPerMonth) => set({ extraPerMonth: Math.max(0, Math.round(extraPerMonth)) }),
      setPaymentDay: (paymentDay) => set({ paymentDay: Math.min(28, Math.max(1, Math.round(paymentDay))) }),
      setSavings: (value) => set({ savings: { ...get().savings, ...value } }),
      setBackupOptIn: (backupOptIn) => set({ backupOptIn }),
      setNudgeEnabled: (nudgeEnabled) => set({ nudgeEnabled }),
      setBaseline: (baseline) => set({ baseline }),
      resetAll: () => set({ ...defaults }),
    }),
    {
      name: 'solvent.settings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ hydrated: _hydrated, ...rest }) => rest,
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
