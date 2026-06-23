'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { A11y, Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';

import type { SpotlightAnime } from '@/shared/types/GlobalAnimeTypes';

import { HeroSpotlightBackgroundImage } from './HeroSpotlightBackgroundImage';

interface PreviewHeroSliderProps {
  spotlights: SpotlightAnime[];
  onSlideChange: (index: number) => void;
  onSwiper: (swiper: SwiperType) => void;
}

export function PreviewHeroSlider({
  spotlights,
  onSlideChange,
  onSwiper,
}: PreviewHeroSliderProps) {
  return (
    <>
      <button
        className="hero-zone hero--right invisible md:visible"
        aria-label="Next slide"
        type="button"
      >
        <ChevronRight width={46} height={46} />
      </button>
      <button
        className="hero-zone hero--left invisible md:visible"
        aria-label="Previous slide"
        type="button"
      >
        <ChevronLeft width={46} height={46} />
      </button>
      <Swiper
        onSwiper={onSwiper}
        onSlideChange={(swiper) => onSlideChange(swiper.realIndex)}
        modules={[Navigation, Pagination, A11y, Autoplay, EffectFade]}
        slidesPerView={1}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        pagination={false}
        navigation={{
          nextEl: '.hero--right',
          prevEl: '.hero--left',
        }}
        autoplay={
          spotlights.length > 1
            ? {
                delay: 5000,
                waitForTransition: true,
              }
            : false
        }
        rewind
      >
        {spotlights.map((anime, index) => (
          <SwiperSlide key={anime.id}>
            <div className="relative h-full min-h-0 w-full">
              <HeroSpotlightBackgroundImage key={anime.id} anime={anime} index={index} />
              <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-[40%] bg-gradient-to-t from-black/80 to-transparent" />
              <div className="preview__shine" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
}
