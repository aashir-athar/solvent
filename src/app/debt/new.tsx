// Add a debt (modal).

import { useRouter } from 'expo-router';
import { Screen, ScreenHeader } from '@/components';
import { DebtForm } from '@/features/debts/DebtForm';
import { useDebtsStore } from '@/stores/useDebtsStore';
import { haptics } from '@/lib/haptics';
import { useTranslation } from '@/i18n';

export default function NewDebt() {
  const router = useRouter();
  const add = useDebtsStore((s) => s.add);
  const { t } = useTranslation();

  return (
    <Screen scroll keyboardAware edges={['top', 'bottom']}>
      <ScreenHeader title={t('debt.new')} onClose={() => router.back()} />
      <DebtForm
        submitLabel={t('debt.addCta')}
        onSubmit={async (values) => {
          await add({
            name: values.name,
            balance: values.balance,
            apr: values.apr,
            minPayment: values.minPayment,
          });
          haptics.success();
          router.back();
        }}
      />
    </Screen>
  );
}
