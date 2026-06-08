// Entitlement seam, backed by RevenueCat.
//
// Pro state is mirrored into useEntitlementStore by the customer-info listener configured
// in features/paywall/revenuecat.ts, so every gated screen (Insights, Settings, the home
// gate) keeps reading the store and nothing downstream changed when billing went live.

import { useCallback } from 'react';
import { useEntitlementStore } from '@/stores/useEntitlementStore';
import { restorePurchases } from './revenuecat';
import { presentCustomerCenter, presentPaywall } from './paywallUi';

export interface EntitlementApi {
  isPro: boolean;
  /** Present the paywall. Returns whether the user is now Pro. */
  purchasePro: () => Promise<boolean>;
  /** Restore prior purchases. Returns whether Pro is now active. */
  restore: () => Promise<boolean>;
  /** Open the RevenueCat Customer Center (manage, restore, cancel, refund). */
  openCustomerCenter: () => Promise<void>;
}

export function useEntitlement(): EntitlementApi {
  const isPro = useEntitlementStore((s) => s.isPro);
  const purchasePro = useCallback(() => presentPaywall(), []);
  const restore = useCallback(() => restorePurchases(), []);
  const openCustomerCenter = useCallback(() => presentCustomerCenter(), []);
  return { isPro, purchasePro, restore, openCustomerCenter };
}
