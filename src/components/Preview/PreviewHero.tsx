'use client';

import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './PreviewHero.scss';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SpotlightAnime, TrendingAnime } from '@/shared/types/GlobalAnimeTypes';
import { EmptyState } from '../ui/states/EmptyState';
import { SwiperCard } from '../SwiperCard/SwiperCard';
import { useHeroPagination } from './useHeroPagination';
import { PreviewHeroSlider } from './preview-hero/PreviewHeroSlider';
import { PreviewHeroSpotlightPanel } from './preview-hero/PreviewHeroSpotlightPanel';

type Props = {
  spotlights: SpotlightAnime[];
  trending: TrendingAnime[];
};

export const Preview = ({ spotlights, trending }: Props) => {
  const { t } = useTranslation('common');
  const [currentIndex, setCurrentIndex] = useState(0);
  const { paginationReady, setPaginationNode, handleSwiper } = useHeroPagination();

  if (!Array.isArray(spotlights)) {
    return (
      <EmptyState
        title={t('home.spotlightUnavailable')}
        message={t('empty.tryLater')}
      />
    );
  }

  if (spotlights.length === 0) {
    return (
      <EmptyState
        title={t('home.noSpotlight')}
        message={t('empty.checkLater')}
      />
    );
  }

  const safeTrending = Array.isArray(trending) ? trending : [];
  const currentAnime = spotlights[currentIndex];

  return (
    <>
      <div className="hero relative w-full">
        <div className="hero__slider">
          <PreviewHeroSlider
            spotlights={spotlights}
            onSlideChange={setCurrentIndex}
            onSwiper={handleSwiper}
          />
          <PreviewHeroSpotlightPanel
            anime={currentAnime}
            spotlights={spotlights}
            currentIndex={currentIndex}
            paginationReady={paginationReady}
            setPaginationNode={setPaginationNode}
          />
        </div>
      </div>
      <div className="hero-trending">
        {safeTrending.length === 0 ? (
          <EmptyState
            title={t('home.noTrending')}
            message={t('empty.checkLater')}
          />
        ) : (
          <SwiperCard
            title={t('home.trending')}
            catalog={safeTrending}
            sectionId="trending"
            prioritySlideCount={4}
          />
        )}
      </div>
    </>
  );
};
