'use client';

import { Palette } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
  APP_THEMES,
  THEME_SWATCHES,
  useTheme,
  type AppTheme,
} from '@/features/theme';
import { APP_LOCALES, LOCALE_LABELS, type AppLocale } from '@/i18n/locales';
import { useAppLocale } from '@/i18n/useAppLocale';
import { cn } from '@/lib/utils';

const THEME_LABEL_KEYS: Record<AppTheme, string> = {
  dark: 'settings.themeDark',
  midnight: 'settings.themeMidnight',
  ember: 'settings.themeEmber',
  neon: 'settings.themeNeon',
  azure: 'settings.themeAzure',
};

export function ProfileSettingsAppearanceCard() {
  const { t } = useTranslation('common');
  const { theme, setTheme } = useTheme();
  const { locale, setLocale } = useAppLocale();

  return (
    <section className="profile-settings__card profile-panel" aria-labelledby="appearance-heading">
      <div className="profile-settings__card-head">
        <span className="profile-settings__card-icon" aria-hidden>
          <Palette size={18} />
        </span>
        <div>
          <h3 id="appearance-heading" className="profile-settings__card-title">
            {t('settings.appearance')}
          </h3>
          <p className="profile-settings__card-desc">{t('settings.appearanceHint')}</p>
        </div>
      </div>

      <div className="profile-settings__field">
        <span className="profile-settings__label">{t('settings.theme')}</span>
        <div className="profile-settings__swatch-row" role="listbox" aria-label={t('settings.theme')}>
          {APP_THEMES.map((id) => {
            const swatch = THEME_SWATCHES[id];
            const selected = theme === id;

            return (
              <button
                key={id}
                type="button"
                role="option"
                aria-selected={selected}
                className={cn(
                  'profile-settings__swatch',
                  selected && 'profile-settings__swatch--active',
                )}
                onClick={() => setTheme(id)}
              >
                <span
                  className="profile-settings__swatch-preview"
                  style={{
                    background: `linear-gradient(135deg, ${swatch.bg} 42%, ${swatch.surface} 42%)`,
                    boxShadow: `inset -10px -8px 0 0 ${swatch.accent}`,
                  }}
                  aria-hidden
                />
                <span className="profile-settings__swatch-name">{t(THEME_LABEL_KEYS[id])}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="profile-settings__field">
        <span className="profile-settings__label">{t('settings.language')}</span>
        <div className="profile-settings__chip-row" role="listbox" aria-label={t('settings.language')}>
          {APP_LOCALES.map((id: AppLocale) => (
            <button
              key={id}
              type="button"
              role="option"
              aria-selected={locale === id}
              className={cn(
                'profile-settings__chip',
                locale === id && 'profile-settings__chip--active',
              )}
              onClick={() => {
                void setLocale(id);
              }}
            >
              {LOCALE_LABELS[id]}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
