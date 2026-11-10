'use client';

import { useTranslation } from 'react-i18next';

import { changeAppLocale } from './I18nProvider';
import { parseAppLocale, type AppLocale } from './locales';

export function useAppLocale(): {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => Promise<void>;
} {
  const { i18n } = useTranslation();

  return {
    locale: parseAppLocale(i18n.language),
    setLocale: changeAppLocale,
  };
}
