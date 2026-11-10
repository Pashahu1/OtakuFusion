export const LOCALE_STORAGE_KEY = 'otakufusion:locale';

export const APP_LOCALES = ['en', 'uk', 'de'] as const;

export type AppLocale = (typeof APP_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = 'en';

export const LOCALE_LABELS: Record<AppLocale, string> = {
  en: 'English',
  uk: 'Українська',
  de: 'Deutsch',
};

export function isAppLocale(value: unknown): value is AppLocale {
  return typeof value === 'string' && (APP_LOCALES as readonly string[]).includes(value);
}

export function parseAppLocale(value: unknown): AppLocale {
  return isAppLocale(value) ? value : DEFAULT_LOCALE;
}

export function appLocaleToBcp47(locale: string): string {
  if (locale.startsWith('uk')) return 'uk-UA';
  if (locale.startsWith('de')) return 'de-DE';
  return 'en-GB';
}
