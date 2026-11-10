'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import deCommon from './locales/de/common.json';
import enCommon from './locales/en/common.json';
import ukCommon from './locales/uk/common.json';
import { DEFAULT_LOCALE } from './locales';

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources: {
      en: { common: enCommon },
      uk: { common: ukCommon },
      de: { common: deCommon },
    },
    lng: DEFAULT_LOCALE,
    fallbackLng: DEFAULT_LOCALE,
    ns: ['common'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    returnNull: false,
  });
}

export default i18n;
