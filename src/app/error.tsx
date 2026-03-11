'use client';

import { useRouter } from 'next/navigation';
import ErrorState from '@/components/ui/states/ErrorState';

export default function Error() {
  const router = useRouter();
  return (
    <ErrorState
      fullPage
      title="Error"
      message="Failed to load data."
      showRetry
      onRetry={() => router.refresh()}
    />
  );
}
