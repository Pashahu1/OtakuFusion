'use client';

import { useRouter } from 'next/navigation';
import { ErrorState } from '@/components/ui/states/ErrorState';

export default function WatchSeriesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <ErrorState
      fullPage
      title="Could not load this title"
      message={error.message || 'Something went wrong while loading the series page.'}
      showRetry
      onRetry={() => {
        reset();
        router.refresh();
      }}
    />
  );
}