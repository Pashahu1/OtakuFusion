'use client';

import { useTranslation } from 'react-i18next';

import { SwiperSectionSkeleton } from '@/components/ui/Skeleton/SwiperSectionSkeleton';
import { WatchEpisodesSkeleton } from './WatchEpisodesSkeleton';
import './WatchPageSkeleton.scss';

export function WatchPageSkeleton() {
  const { t } = useTranslation('common');

  return (
    <div className="watch-page-skeleton" aria-busy aria-label={t('watch.loadingSeries')}>
      <div className="watch-page-skeleton__hero" />
      <WatchEpisodesSkeleton />
      <div className="watch-page-skeleton__recommended">
        <SwiperSectionSkeleton title={t('watch.recommended')} />
      </div>
    </div>
  );
}
