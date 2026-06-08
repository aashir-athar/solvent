// Paywall (modal): the RevenueCat dashboard-configured paywall, presented full screen.
// Lever: objection handling through RevenueCat's offering presentation. Purchases sync
// into the entitlement store via the customer-info listener; these callbacks also mirror
// the result immediately and dismiss the modal.

import { View } from 'react-native';
import { useRouter } from 'expo-router';
import RevenueCatUI from 'react-native-purchases-ui';
import { useEntitlementStore } from '@/stores/useEntitlementStore';
import { hasProEntitlement } from '@/features/paywall/revenuecat';
import { haptics } from '@/lib/haptics';

export default function Paywall() {
  const router = useRouter();
  const setPro = useEntitlementStore((s) => s.setPro);

  return (
    <View style={{ flex: 1 }}>
      <RevenueCatUI.Paywall
        onPurchaseCompleted={({ customerInfo }) => {
          setPro(hasProEntitlement(customerInfo));
          haptics.success();
          router.back();
        }}
        onRestoreCompleted={({ customerInfo }) => {
          setPro(hasProEntitlement(customerInfo));
          router.back();
        }}
        onDismiss={() => router.back()}
      />
    </View>
  );
}
