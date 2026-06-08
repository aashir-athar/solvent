// 404. Calm, with a way home.

import { useRouter } from 'expo-router';
import { HelpIcon, EmptyState, Screen, ScreenHeader } from '@/components';
import { useTranslation } from '@/i18n';

export default function NotFound() {
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <Screen edges={['top', 'bottom']}>
      <ScreenHeader title="" onBack={() => router.back()} />
      <EmptyState
        Icon={HelpIcon}
        title={t('notFound.title')}
        message={t('notFound.body')}
        actionLabel={t('notFound.cta')}
        onAction={() => router.replace('/(tabs)')}
      />
    </Screen>
  );
}
