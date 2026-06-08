// i18n engine. One persisted language choice drives a synchronous t() (usable inside the
// coach and any module) plus a useTranslation() hook for reactive components. Missing
// translations fall back to English, so no string is ever blank. RTL is applied for
// Arabic and Urdu (full effect after the next app launch, per RN's I18nManager).

import { I18nManager } from 'react-native';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { en } from './translations/en';
import { ur } from './translations/ur';
import { hi } from './translations/hi';
import { ar } from './translations/ar';
import { id } from './translations/id';
import { pt } from './translations/pt';
import type { TranslationKey } from './types';

export type Language = 'en' | 'ur' | 'hi' | 'ar' | 'id' | 'pt';
export type { TranslationKey };

export interface LanguageOption {
  code: Language;
  name: string;
  native: string;
  rtl: boolean;
}

export const LANGUAGES: readonly LanguageOption[] = [
  { code: 'en', name: 'English', native: 'English', rtl: false },
  { code: 'ur', name: 'Urdu', native: 'اردو', rtl: true },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', rtl: false },
  { code: 'ar', name: 'Arabic', native: 'العربية', rtl: true },
  { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia', rtl: false },
  { code: 'pt', name: 'Portuguese', native: 'Português', rtl: false },
];

const DICTIONARIES: Record<Language, Partial<Record<TranslationKey, string>>> = { en, ur, hi, ar, id, pt };

export function isRtl(language: Language): boolean {
  return language === 'ar' || language === 'ur';
}

function applyRtl(language: Language): void {
  try {
    I18nManager.allowRTL(isRtl(language));
    I18nManager.forceRTL(isRtl(language));
  } catch {
    // I18nManager not available in this environment; direction stays default.
  }
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_match, name: string) =>
    name in params ? String(params[name]) : `{${name}}`,
  );
}

function lookup(language: Language, key: TranslationKey): string {
  return DICTIONARIES[language][key] ?? en[key] ?? key;
}

interface I18nState {
  language: Language;
  hydrated: boolean;
  setLanguage: (language: Language) => void;
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set) => ({
      language: 'en',
      hydrated: false,
      setLanguage: (language) => {
        set({ language });
        applyRtl(language);
      },
    }),
    {
      name: 'solvent.language',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ hydrated: _hydrated, ...rest }) => rest,
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hydrated = true;
          applyRtl(state.language);
        }
      },
    },
  ),
);

/** Synchronous translate, usable anywhere (including the coach). */
export function translate(key: TranslationKey, params?: Record<string, string | number>): string {
  return interpolate(lookup(useI18nStore.getState().language, key), params);
}

/** Reactive translate for components: re-renders when the language changes. */
export function useTranslation() {
  const language = useI18nStore((s) => s.language);
  const t = (key: TranslationKey, params?: Record<string, string | number>) =>
    interpolate(lookup(language, key), params);
  return { t, language, rtl: isRtl(language) };
}
