'use client';

import { useEffect, type ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';

import i18n from './config';
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  parseAppLocale,
  type AppLocale,
} from './locales';

function readStoredLocale(): AppLocale {
  try {
    return parseAppLocale(localStorage.getItem(LOCALE_STORAGE_KEY));
  } catch {
    return DEFAULT_LOCALE;
  }
}

export async function changeAppLocale(locale: AppLocale): Promise<void> {
  const next = parseAppLocale(locale);
  await i18n.changeLanguage(next);
  document.documentElement.lang = next;
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, next);
  } catch {
    /* ignore quota / private mode */
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const stored = readStoredLocale();
    if (stored !== i18n.language) {
      void changeAppLocale(stored);
    } else {
      document.documentElement.lang = stored;
    }
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
