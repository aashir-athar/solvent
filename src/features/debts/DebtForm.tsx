// Shared add / edit debt form. react-hook-form + zod, amounts in minor units.

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { View } from 'react-native';
import { Button, MoneyField, TextField } from '@/components';
import { useTheme } from '@/theme';
import { debtFormSchema, type DebtFormValues } from '@/schemas/debt';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useTranslation } from '@/i18n';

export interface DebtFormProps {
  defaultValues?: Partial<DebtFormValues>;
  submitLabel: string;
  onSubmit: (values: DebtFormValues) => Promise<void> | void;
  onDelete?: () => void;
}

export function DebtForm({ defaultValues, submitLabel, onSubmit, onDelete }: DebtFormProps) {
  const theme = useTheme();
  const currency = useSettingsStore((s) => s.currency);
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DebtFormValues>({
    resolver: zodResolver(debtFormSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      balance: defaultValues?.balance,
      apr: defaultValues?.apr ?? 0,
      minPayment: defaultValues?.minPayment ?? 0,
    },
  });

  return (
    <View style={{ gap: theme.space.lg }}>
      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <TextField
            label={t('debt.name')}
            value={field.value}
            onChangeText={field.onChange}
            placeholder="Credit card"
            error={errors.name?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="balance"
        render={({ field }) => (
          <MoneyField
            label={t('debt.balance')}
            value={field.value}
            onChangeMinor={field.onChange}
            error={errors.balance?.message}
          />
        )}
      />

      <View style={{ flexDirection: 'row', gap: theme.space.md }}>
        <View style={{ flex: 1 }}>
          <Controller
            control={control}
            name="apr"
            render={({ field }) => (
              <TextField
                label={t('debt.apr')}
                value={field.value === undefined ? '' : String(field.value)}
                onChangeText={(t) => field.onChange(t === '' ? 0 : Number.parseFloat(t.replace(/[^0-9.]/g, '')))}
                keyboardType="decimal-pad"
                placeholder="0"
                error={errors.apr?.message}
              />
            )}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Controller
            control={control}
            name="minPayment"
            render={({ field }) => (
              <MoneyField
                label={t('debt.min')}
                value={field.value}
                onChangeMinor={(v) => field.onChange(v ?? 0)}
                error={errors.minPayment?.message}
              />
            )}
          />
        </View>
      </View>

      <View style={{ gap: theme.space.md, marginTop: theme.space.md }}>
        <Button label={submitLabel} loading={isSubmitting} onPress={handleSubmit(onSubmit)} />
        {onDelete ? <Button label={t('debt.deleteCta')} variant="ghost" onPress={onDelete} /> : null}
      </View>
    </View>
  );
}
