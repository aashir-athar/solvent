// Pro entitlement. Persisted locally. In production this is set by the billing
// provider (see features/paywall/entitlement.ts); the store is the single source the
// UI reads so gating logic never depends on a specific vendor.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface EntitlementState {
  isPro: boolean;
  setPro: (value: boolean) => void;
}

export const useEntitlementStore = create<EntitlementState>()(
  persist(
    (set) => ({
      isPro: false,
      setPro: (isPro) => set({ isPro }),
    }),
    {
      name: 'solvent.entitlement',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
