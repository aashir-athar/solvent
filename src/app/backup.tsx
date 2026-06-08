// Encrypted backup (modal). Pick a passphrase, get one encrypted file you control.
// Solvent never uploads it. Restore replaces local data with the backup's contents.

import { useState } from 'react';
import { Alert, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Divider, Screen, ScreenHeader, Text, TextField } from '@/components';
import { useTheme } from '@/theme';
import { exportEncryptedBackup, importEncryptedBackup } from '@/features/backup/backup';
import { haptics } from '@/lib/haptics';
import { errorReporter } from '@/lib/errorReporter';
import { useTranslation } from '@/i18n';

export default function BackupScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const [passphrase, setPassphrase] = useState('');
  const [busy, setBusy] = useState<'export' | 'import' | null>(null);
  const valid = passphrase.trim().length >= 6;

  const onExport = async () => {
    if (!valid) return;
    setBusy('export');
    try {
      await exportEncryptedBackup(passphrase);
      haptics.success();
    } catch (error) {
      errorReporter.captureError(error, { scope: 'backup.export' });
      Alert.alert(t('backup.failedTitle'), t('backup.failedBody'));
    } finally {
      setBusy(null);
    }
  };

  const onImport = async () => {
    if (!valid) return;
    setBusy('import');
    try {
      const result = await importEncryptedBackup(passphrase);
      if (result === 'imported') {
        haptics.success();
        Alert.alert(t('backup.restoredTitle'), t('backup.restoredBody'), [
          { text: 'OK', onPress: () => router.replace('/(tabs)') },
        ]);
      }
    } catch (error) {
      errorReporter.captureError(error, { scope: 'backup.import' });
      Alert.alert(t('backup.couldNotTitle'), t('backup.couldNotBody'));
    } finally {
      setBusy(null);
    }
  };

  return (
    <Screen scroll keyboardAware edges={['top', 'bottom']}>
      <ScreenHeader title={t('backup.title')} onClose={() => router.back()} />

      <View style={{ gap: theme.space.lg, paddingTop: theme.space.md }}>
        <Text variant="body" color="secondary">
          {t('backup.body')}
        </Text>

        <TextField
          label={t('backup.passphrase')}
          value={passphrase}
          onChangeText={setPassphrase}
          secureTextEntry
          autoCapitalize="none"
          placeholder={t('backup.passphrasePlaceholder')}
          helper={t('backup.passphraseHelper')}
        />

        <Button label={t('backup.create')} loading={busy === 'export'} disabled={!valid} onPress={onExport} />

        <Divider />

        <View style={{ gap: theme.space.xs }}>
          <Text variant="subtitle">{t('backup.restoreTitle')}</Text>
          <Text variant="bodySm" color="secondary">
            {t('backup.restoreBody')}
          </Text>
        </View>
        <Button
          label={t('backup.restore')}
          variant="secondary"
          loading={busy === 'import'}
          disabled={!valid}
          onPress={onImport}
        />
      </View>
    </Screen>
  );
}
