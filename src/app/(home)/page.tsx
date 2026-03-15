import { HomeContent } from '@/app/(home)/_components/HomeContent';
import { HomeFallback } from '@/app/(home)/_components/HomeFallback';
import { Suspense } from 'react';

export const revalidate = 3600;

export default function Home() {
  return (
    <Suspense fallback={<HomeFallback />}>
      <HomeContent />
    </Suspense>
  );
}
