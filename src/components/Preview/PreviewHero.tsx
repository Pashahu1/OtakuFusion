'use client';

import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './PreviewHero.scss';

import { useState } from 'react';
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const { paginationReady, setPaginationNode, handleSwiper } = useHeroPagination();

  if (!Array.isArray(spotlights)) {
    return (
      <EmptyState
        title="Spotlight data is unavailable"
        message="Please try again later."
      />
    );
  }

  if (spotlights.length === 0) {
    return (
      <EmptyState
        title="No spotlight anime available"
        message="Please check back later."
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
            title="No trending anime"
            message="Please check back later."
          />
        ) : (
          <SwiperCard title="Trending" catalog={safeTrending} sectionId="trending" />
        )}
      </div>
    </>
  );
};
