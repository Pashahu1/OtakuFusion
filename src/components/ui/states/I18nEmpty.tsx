'use client';

import { useTranslation } from 'react-i18next';

import { EmptyState } from './EmptyState';

interface I18nEmptyProps {
  titleKey: string;
  messageKey: string;
  values?: Record<string, unknown>;
  tValues?: Record<string, string>;
  fullPage?: boolean;
}

export function I18nEmpty({
  titleKey,
  messageKey,
  values,
  tValues,
  fullPage,
}: I18nEmptyProps) {
  const { t } = useTranslation('common');
  const interpolated = {
    ...values,
    ...Object.fromEntries(
      Object.entries(tValues ?? {}).map(([key, i18nKey]) => [
        key,
        t(i18nKey, { defaultValue: String(values?.[key] ?? i18nKey) }),
      ]),
    ),
  };

  return (
    <EmptyState
      title={t(titleKey)}
      message={t(messageKey, interpolated)}
      fullPage={fullPage}
    />
  );
}
