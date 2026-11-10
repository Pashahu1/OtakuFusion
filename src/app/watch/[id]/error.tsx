'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { ErrorState } from '@/components/ui/states/ErrorState';

export default function WatchSeriesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const { t } = useTranslation('common');

  return (
    <ErrorState
      fullPage
      title={t('watch.titleLoadError')}
      message={error.message || t('watch.titleLoadHint')}
      showRetry
      onRetry={() => {
        reset();
        router.refresh();
      }}
    />
  );
}