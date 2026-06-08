// Privacy: the promise made tangible. What stays on the device, why, and the open repo
// that lets anyone verify it. Lever: trust through transparency, the reason a money app
// earns word of mouth.

import { Alert, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import {
  Button,
  Divider,
  ExternalLinkIcon,
  GlobeIcon,
  LockIcon,
  PressableRow,
  ReceiptIcon,
  Screen,
  ShieldCheckIcon,
  Text,
  type IconProps,
} from '@/components';
import { useTheme } from '@/theme';
import { eraseAllData } from '@/db/database';
import { useDebtsStore } from '@/stores/useDebtsStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useEntitlementStore } from '@/stores/useEntitlementStore';
import { haptics } from '@/lib/haptics';
import { useTranslation } from '@/i18n';

const REPO_URL = 'https://github.com/aashir-athar/solvent';

export default function PrivacyScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const loadDebts = useDebtsStore((s) => s.load);
  const resetSettings = useSettingsStore((s) => s.resetAll);
  const setPro = useEntitlementStore((s) => s.setPro);

  const eraseEverything = () => {
    Alert.alert(
      t('privacy.eraseTitle'),
      t('privacy.eraseBody'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('privacy.erase'),
          style: 'destructive',
          onPress: async () => {
            await eraseAllData();
            await loadDebts();
            resetSettings();
            setPro(false);
            haptics.warning();
            router.replace('/onboarding');
          },
        },
      ],
    );
  };

  return (
    <Screen scroll>
      <View style={{ paddingTop: theme.space.sm, gap: theme.space['2xl'] }}>
        <View style={{ gap: theme.space.md }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: theme.radii['2xl'],
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.color.accent.subtle,
            }}
          >
            <ShieldCheckIcon size={30} color={theme.color.accent.text} strokeWidth={1.8} />
          </View>
          <Text variant="h1">{t('privacy.title')}</Text>
          <Text variant="body" color="secondary" style={{ maxWidth: 360 }}>
            {t('privacy.body')}
          </Text>
        </View>

        <View>
          <Divider />
          <InfoRow Icon={LockIcon} title={t('privacy.noLogin')} subtitle={t('privacy.noLoginSub')} />
          <Divider inset={56} />
          <InfoRow Icon={GlobeIcon} title={t('privacy.noCloud')} subtitle={t('privacy.noCloudSub')} />
          <Divider inset={56} />
          <InfoRow Icon={ReceiptIcon} title={t('privacy.openSource')} subtitle={t('privacy.openSourceSub')} />
          <Divider />
        </View>

        <View>
          <Divider />
          <PressableRow
            title={t('privacy.audit')}
            subtitle={t('privacy.auditSub')}
            Icon={ExternalLinkIcon}
            trailing={<ExternalLinkIcon size={18} color={theme.color.text.muted} strokeWidth={2} />}
            onPress={() => void WebBrowser.openBrowserAsync(REPO_URL)}
          />
          <Divider />
        </View>

        <View style={{ gap: theme.space.sm }}>
          <Text variant="subtitle">{t('privacy.storesTitle')}</Text>
          <Text variant="bodySm" color="secondary">
            {t('privacy.storesBody')}
          </Text>
        </View>

        <View>
          <Divider />
          <PressableRow
            title={t('privacy.backup')}
            subtitle={t('privacy.backupSub')}
            Icon={LockIcon}
            showChevron
            onPress={() => router.push('/backup')}
          />
          <Divider />
        </View>

        <View style={{ gap: theme.space.sm, paddingTop: theme.space.md }}>
          <Button label={t('privacy.erase')} variant="danger" onPress={eraseEverything} />
          <Text variant="caption" color="muted">
            {t('privacy.eraseNote')}
          </Text>
        </View>
      </View>
    </Screen>
  );
}

function InfoRow({ Icon, title, subtitle }: { Icon: React.ComponentType<IconProps>; title: string; subtitle: string }) {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <View style={{ flexDirection: 'row', gap: theme.space.md, alignItems: 'center', paddingVertical: theme.space.md }}>
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: theme.radii.md,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.color.bg.subtle,
        }}
      >
        <Icon size={20} color={theme.color.text.primary} strokeWidth={2} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="bodyMedium">{title}</Text>
        <Text variant="bodySm" color="secondary">
          {subtitle}
        </Text>
      </View>
    </View>
  );
}
