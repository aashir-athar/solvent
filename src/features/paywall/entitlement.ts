// Entitlement seam.
//
// Pro gating reads from one place (useEntitlementStore) so the UI never depends on a
// billing vendor. This LocalEntitlement implementation flips the local flag, which is
// correct for development and sideloaded builds.
//
// To ship paid: install react-native-purchases (RevenueCat) in a dev client, configure
// the iOS/Android API keys, and replace the bodies of purchasePro/restore with
// Purchases.purchasePackage / Purchases.restorePurchases, then call setPro with the
// resulting entitlement. The store and every gated screen stay unchanged. Exact steps
// live in zero-to-deploy.md.

import { useCallback } from 'react';
import { useEntitlementStore } from '@/stores/useEntitlementStore';

export interface EntitlementApi {
  isPro: boolean;
  purchasePro: () => Promise<boolean>;
  restore: () => Promise<boolean>;
}

export function useEntitlement(): EntitlementApi {
  const isPro = useEntitlementStore((s) => s.isPro);
  const setPro = useEntitlementStore((s) => s.setPro);

  const purchasePro = useCallback(async () => {
    // Production: const { customerInfo } = await Purchases.purchasePackage(pkg);
    //             setPro(Boolean(customerInfo.entitlements.active.pro));
    setPro(true);
    return true;
  }, [setPro]);

  const restore = useCallback(async () => {
    // Production: const info = await Purchases.restorePurchases();
    //             setPro(Boolean(info.entitlements.active.pro));
    return isPro;
  }, [isPro]);

  return { isPro, purchasePro, restore };
}
