// RevenueCat configuration and entitlement sync.
//
// The whole app reads Pro state from useEntitlementStore. This module is the only place
// that talks to RevenueCat: it configures the SDK once, listens for customer-info updates,
// and mirrors the "Solvent Pro" entitlement into the store. Every gated screen keeps
// reading the store, so nothing downstream changes.
//
// Native module: runs in a dev client / production build, not Expo Go.

import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL, type CustomerInfo, type PurchasesOffering } from 'react-native-purchases';
import { useEntitlementStore } from '@/stores/useEntitlementStore';
import { errorReporter } from '@/lib/errorReporter';

/** Must match the entitlement identifier configured in the RevenueCat dashboard. */
export const ENTITLEMENT_ID = 'Solvent Pro';

/** Product identifiers to attach to an Offering in the dashboard. */
export const PRODUCT_IDS = {
  lifetime: 'lifetime',
  yearly: 'yearly',
  monthly: 'monthly',
} as const;

// RevenueCat public SDK keys are safe to ship. The test key works cross-platform for
// development; set real platform keys via env for production (see .env.example).
const TEST_API_KEY = 'test_dCbEtiwbHyZBKOzuULwAoZLhwmH';
const API_KEY =
  Platform.select({
    ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
    android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
  }) ?? TEST_API_KEY;

let configured = false;

export function hasProEntitlement(info: CustomerInfo): boolean {
  return info.entitlements.active[ENTITLEMENT_ID] !== undefined;
}

function syncEntitlement(info: CustomerInfo): void {
  useEntitlementStore.getState().setPro(hasProEntitlement(info));
}

/** Configure once at startup, then keep the local entitlement in sync with RevenueCat. */
export async function configureRevenueCat(): Promise<void> {
  if (configured) return;
  try {
    if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    Purchases.configure({ apiKey: API_KEY });
    configured = true;
    Purchases.addCustomerInfoUpdateListener(syncEntitlement);
    syncEntitlement(await Purchases.getCustomerInfo());
  } catch (error) {
    errorReporter.captureError(error, { scope: 'revenuecat.configure' });
  }
}

/** The current offering (Lifetime / Yearly / Monthly packages live here). */
export async function getCurrentOffering(): Promise<PurchasesOffering | null> {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current ?? null;
  } catch (error) {
    errorReporter.captureError(error, { scope: 'revenuecat.offerings' });
    return null;
  }
}

/** Restore prior purchases and sync entitlement. Returns whether Pro is now active. */
export async function restorePurchases(): Promise<boolean> {
  try {
    const info = await Purchases.restorePurchases();
    syncEntitlement(info);
    return hasProEntitlement(info);
  } catch (error) {
    errorReporter.captureError(error, { scope: 'revenuecat.restore' });
    return useEntitlementStore.getState().isPro;
  }
}
