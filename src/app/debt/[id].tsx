// Edit or delete a debt (modal).

import { Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CreditCardIcon, EmptyState, Screen, ScreenHeader } from '@/components';
import { DebtForm } from '@/features/debts/DebtForm';
import { useDebtsStore } from '@/stores/useDebtsStore';
import { haptics } from '@/lib/haptics';
import { useTranslation } from '@/i18n';

export default function EditDebt() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const debt = useDebtsStore((s) => s.debts.find((d) => d.id === id));
  const update = useDebtsStore((s) => s.update);
  const remove = useDebtsStore((s) => s.remove);
  const { t } = useTranslation();

  if (!debt) {
    return (
      <Screen edges={['top', 'bottom']}>
        <ScreenHeader title={t('debt.edit')} onClose={() => router.back()} />
        <EmptyState
          Icon={CreditCardIcon}
          title={t('debt.goneTitle')}
          message={t('debt.goneBody')}
          actionLabel={t('debt.goneCta')}
          onAction={() => router.back()}
        />
      </Screen>
    );
  }

  const confirmDelete = () => {
    Alert.alert(t('debt.deleteTitle'), t('debt.deleteBody', { name: debt.name }), [
      { text: t('debt.deleteKeep'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await remove(debt.id);
          haptics.warning();
          router.back();
        },
      },
    ]);
  };

  return (
    <Screen scroll keyboardAware edges={['top', 'bottom']}>
      <ScreenHeader title={t('debt.edit')} onClose={() => router.back()} />
      <DebtForm
        defaultValues={{ name: debt.name, balance: debt.balance, apr: debt.apr, minPayment: debt.minPayment }}
        submitLabel={t('debt.saveCta')}
        onSubmit={async (values) => {
          await update(debt.id, {
            name: values.name,
            balance: values.balance,
            apr: values.apr,
            minPayment: values.minPayment,
          });
          haptics.success();
          router.back();
        }}
        onDelete={confirmDelete}
      />
    </Screen>
  );
}
