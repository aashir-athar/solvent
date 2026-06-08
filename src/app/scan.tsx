// Scan or paste a statement (modal). Paste works today; photo scanning is enabled once
// a native recognizer is registered (see features/ocr/recognizer.ts). Every extracted
// debt is a suggestion the user confirms before it is saved. Lever: human-in-the-loop.

import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import {
  Button,
  CheckCircleIcon,
  Divider,
  Screen,
  ScreenHeader,
  SegmentedControl,
  Text,
  TextField,
} from '@/components';
import { useTheme } from '@/theme';
import { parseStatement, type OcrCandidate } from '@/features/ocr/parser';
import { isPhotoScanAvailable, recognizeImageText } from '@/features/ocr/recognizer';
import { useDebtsStore } from '@/stores/useDebtsStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { formatMoney } from '@/lib/format';
import { haptics } from '@/lib/haptics';
import { errorReporter } from '@/lib/errorReporter';
import { useTranslation } from '@/i18n';

type Mode = 'paste' | 'photo';

export default function ScanScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const add = useDebtsStore((s) => s.add);
  const currency = useSettingsStore((s) => s.currency);
  const locale = useSettingsStore((s) => s.locale);

  const MODE_OPTIONS: ReadonlyArray<{ value: Mode; label: string }> = [
    { value: 'paste', label: t('scan.paste') },
    { value: 'photo', label: t('scan.photo') },
  ];

  const [mode, setMode] = useState<Mode>('paste');
  const [text, setText] = useState('');
  const [candidates, setCandidates] = useState<OcrCandidate[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const setCandidatesAll = (list: OcrCandidate[]) => {
    setCandidates(list);
    setSelected(new Set(list.map((_, i) => i)));
  };

  const onParseText = () => {
    const found = parseStatement(text);
    setCandidatesAll(found);
    if (found.length === 0) {
      Alert.alert(t('scan.nothingTitle'), t('scan.nothingBody'));
    } else {
      haptics.light();
    }
  };

  const onPickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t('scan.photosOffTitle'), t('scan.photosOffBody'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
    if (result.canceled) return;
    const uri = result.assets[0]?.uri;
    if (!uri) return;

    if (!isPhotoScanAvailable()) {
      Alert.alert(t('scan.setupTitle'), t('scan.setupBody'));
      setMode('paste');
      return;
    }
    try {
      const recognized = await recognizeImageText(uri);
      setCandidatesAll(recognized ? parseStatement(recognized) : []);
    } catch (error) {
      errorReporter.captureError(error, { scope: 'ocr.recognize' });
      Alert.alert(t('scan.readFailTitle'), t('scan.readFailBody'));
    }
  };

  const toggle = (index: number) => {
    haptics.selection();
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const addSelected = async () => {
    const chosen = candidates.filter((_, i) => selected.has(i));
    for (const c of chosen) {
      await add({ name: c.name, balance: c.balance, apr: c.apr ?? 0, minPayment: 0 });
    }
    haptics.success();
    router.replace('/(tabs)/goals');
  };

  return (
    <Screen scroll keyboardAware edges={['top', 'bottom']}>
      <ScreenHeader title={t('scan.title')} onClose={() => router.back()} />

      <View style={{ gap: theme.space.lg, paddingTop: theme.space.md }}>
        <SegmentedControl options={MODE_OPTIONS} value={mode} onChange={setMode} accessibilityLabel="Import method" />

        {mode === 'paste' ? (
          <View style={{ gap: theme.space.md }}>
            <TextField
              label={t('scan.pasteLabel')}
              value={text}
              onChangeText={setText}
              multiline
              placeholder={'e.g.\nVisa  4,210.55  19.99%\nCar loan  12,300  6.5%'}
            />
            <Button label={t('scan.find')} onPress={onParseText} disabled={text.trim().length === 0} />
          </View>
        ) : (
          <View style={{ gap: theme.space.sm }}>
            <Text variant="body" color="secondary">
              {t('scan.photoBody')}
            </Text>
            <Button label={t('scan.choosePhoto')} onPress={onPickPhoto} />
          </View>
        )}

        {candidates.length > 0 ? (
          <View style={{ gap: theme.space.sm }}>
            <Divider />
            <Text variant="subtitle">{t('scan.foundCount', { count: candidates.length })}</Text>
            <Text variant="bodySm" color="secondary">
              {t('scan.foundHint')}
            </Text>
            <View>
              {candidates.map((c, i) => (
                <View key={`${c.name}-${i}`}>
                  {i > 0 ? <Divider /> : null}
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selected.has(i) }}
                    accessibilityLabel={`${c.name}, ${formatMoney(c.balance, currency, locale)}`}
                    onPress={() => toggle(i)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.md, paddingVertical: theme.space.md }}
                  >
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        borderWidth: 2,
                        borderColor: selected.has(i) ? theme.color.accent.solid : theme.color.border.default,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: selected.has(i) ? theme.color.accent.solid : 'transparent',
                      }}
                    >
                      {selected.has(i) ? <CheckCircleIcon size={16} color={theme.color.text.onAccent} strokeWidth={2.5} /> : null}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text variant="bodyMedium">{c.name}</Text>
                      {c.apr !== undefined ? (
                        <Text variant="bodySm" color="secondary">
                          {c.apr}% APR
                        </Text>
                      ) : null}
                    </View>
                    <Text variant="monoMedium">{formatMoney(c.balance, currency, locale)}</Text>
                  </Pressable>
                </View>
              ))}
            </View>
            <Button
              label={selected.size === 1 ? t('scan.addOne') : t('scan.addCount', { count: selected.size })}
              disabled={selected.size === 0}
              onPress={addSelected}
            />
          </View>
        ) : null}
      </View>
    </Screen>
  );
}
