'use client';

import { type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import './empty-error-state.scss';

interface ErrorStateProps {
  title?: string;
  message?: string;
  icon?: ReactNode;
  showRetry?: boolean;
  onRetry?: () => void;
  fullPage?: boolean;
}

export function ErrorState({
  title,
  message,
  icon,
  showRetry = true,
  onRetry,
  fullPage = false,
}: ErrorStateProps) {
  const router = useRouter();
  const { t } = useTranslation('common');

  function handleRetry() {
    if (onRetry) onRetry();
    else router.refresh();
  }

  return (
    <div className={cn('of-feedback', fullPage && 'of-feedback--full')}>
      {icon ? <div className="of-feedback__icon">{icon}</div> : null}
      <h2 className="of-feedback__title">{title ?? t('empty.errorTitle')}</h2>
      <p className="of-feedback__message">{message ?? t('empty.errorMessage')}</p>
      {showRetry ? (
        <button
          type="button"
          onClick={handleRetry}
          className="hero-cta hero-cta--compact of-feedback__action"
        >
          {t('actions.retry')}
        </button>
      ) : null}
    </div>
  );
}
