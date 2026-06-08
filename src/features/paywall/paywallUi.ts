// Thin wrappers over the RevenueCat Paywall + Customer Center UI. Screens call these so
// they never import the native UI module directly, and so cancellation is handled quietly
// (a cancelled paywall is a normal outcome, not an error).

import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { ENTITLEMENT_ID } from './revenuecat';
import { errorReporter } from '@/lib/errorReporter';

function isPurchase(result: PAYWALL_RESULT): boolean {
  return result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED;
}

/** Present the dashboard-configured paywall. Returns whether the user is now Pro. */
export async function presentPaywall(): Promise<boolean> {
  try {
    return isPurchase(await RevenueCatUI.presentPaywall());
  } catch (error) {
    errorReporter.captureError(error, { scope: 'revenuecat.presentPaywall' });
    return false;
  }
}

/** Present the paywall only if Solvent Pro is not already active. */
export async function presentPaywallIfNeeded(): Promise<boolean> {
  try {
    const result = await RevenueCatUI.presentPaywallIfNeeded({ requiredEntitlementIdentifier: ENTITLEMENT_ID });
    return isPurchase(result);
  } catch (error) {
    errorReporter.captureError(error, { scope: 'revenuecat.presentPaywallIfNeeded' });
    return false;
  }
}

/** Present the Customer Center (manage, restore, cancel, refund). */
export async function presentCustomerCenter(): Promise<void> {
  try {
    await RevenueCatUI.presentCustomerCenter();
  } catch (error) {
    errorReporter.captureError(error, { scope: 'revenuecat.customerCenter' });
  }
}
