'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { ErrorState } from '@/components/ui/states/ErrorState';

export default function Error() {
  const router = useRouter();
  const { t } = useTranslation('common');
  return (
    <ErrorState
      fullPage
      message={t('empty.pageFailed')}
      showRetry
      onRetry={() => router.refresh()}
    />
  );
}
