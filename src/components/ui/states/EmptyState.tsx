'use client';

import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import './empty-error-state.scss';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: ReactNode;
  fullPage?: boolean;
  plain?: boolean;
  /** `panel` matches profile / schedule surfaces. */
  surface?: 'default' | 'panel';
}

export function EmptyState({
  title,
  message,
  icon,
  fullPage = false,
  plain = false,
  surface = 'default',
}: EmptyStateProps) {
  const { t } = useTranslation('common');

  return (
    <section
      className={cn(
        'of-feedback',
        fullPage && 'of-feedback--full',
        !plain && surface === 'panel' && 'of-feedback--panel',
      )}
    >
      {icon ? <div className="of-feedback__icon">{icon}</div> : null}
      <h2 className="of-feedback__title">{title ?? t('empty.title')}</h2>
      {message || !title ? (
        <p className="of-feedback__message">{message ?? t('empty.message')}</p>
      ) : null}
    </section>
  );
}
