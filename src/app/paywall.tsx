// Paywall (modal). PASTOR, compressed: name the moment, show what Pro adds, make the
// offer, handle the real objection (trust), give a clean response. No fake urgency, no
// dark patterns. The privacy promise holds on every tier.

import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, CheckIcon, Screen, ScreenHeader, Text } from '@/components';
import { useTheme } from '@/theme';
import { useEntitlement } from '@/features/paywall/entitlement';
import { haptics } from '@/lib/haptics';
import { useTranslation } from '@/i18n';

export default function Paywall() {
  const theme = useTheme();
  const router = useRouter();
  const { isPro, purchasePro, restore } = useEntitlement();
  const { t } = useTranslation();

  const FEATURES = [
    t('paywall.feature1'),
    t('paywall.feature2'),
    t('paywall.feature3'),
    t('paywall.feature4'),
  ];

  const onStart = async () => {
    const ok = await purchasePro();
    if (ok) {
      haptics.success();
      router.back();
    }
  };

  return (
    <Screen scroll edges={['top', 'bottom']}>
      <ScreenHeader title="" onClose={() => router.back()} />

      <View style={{ gap: theme.space.xl, paddingTop: theme.space.sm }}>
        <View style={{ gap: theme.space.sm }}>
          <Text variant="overline" color="muted">
            {t('paywall.overline')}
          </Text>
          <Text variant="display">{t('paywall.title')}</Text>
          <Text variant="body" color="secondary" style={{ maxWidth: 360 }}>
            {t('paywall.body')}
          </Text>
        </View>

        <View style={{ gap: theme.space.md }}>
          {FEATURES.map((feature) => (
            <View key={feature} style={{ flexDirection: 'row', gap: theme.space.sm, alignItems: 'flex-start' }}>
              <View style={{ paddingTop: 2 }}>
                <CheckIcon size={20} color={theme.color.accent.text} strokeWidth={2.5} />
              </View>
              <Text variant="body" style={{ flex: 1 }}>
                {feature}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ gap: theme.space.xs }}>
          <Text variant="title">{t('paywall.price')}</Text>
          <Text variant="bodySm" color="secondary">
            {t('paywall.priceSub')}
          </Text>
        </View>

        <View style={{ gap: theme.space.md }}>
          <Button label={isPro ? t('paywall.have') : t('paywall.start')} disabled={isPro} onPress={onStart} />
          <Button label={t('paywall.restore')} variant="ghost" onPress={() => void restore()} hapticOnPress={false} />
        </View>
      </View>
    </Screen>
  );
}
