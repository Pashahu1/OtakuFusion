'use client';
import {
  A11y,
  Navigation,
  Pagination,
  Autoplay,
} from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import {
  spotlightHeroBackgroundUrl,
} from '@/shared/utils/thumbnail-url';
import 'swiper/css/effect-fade';
import { EffectFade } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './PreviewHero.scss';
import Image from 'next/image';
import type {
  SpotlightAnime,
  TrendingAnime,
} from '@/shared/types/GlobalAnimeTypes';
import { useState, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { EmptyState } from '../ui/states/EmptyState';
import { SwiperCard } from '../SwiperCard/SwiperCard';
import { buildHeroMetaItems } from './hero-slide-meta';
import { HeroSlideActions } from './HeroSlideActions';
import { HeroSlideGenres } from './HeroSlideGenres';
import { HeroSlideMeta } from './HeroSlideMeta';
import { HeroSlideTitle } from './HeroSlideTitle';

/** Custom pagination `el` mounts after Swiper — bind after init without remount (see Swiper + React: custom pagination). */
function bindHeroPagination(swiper: SwiperType, el: HTMLDivElement | null) {
  if (!el || swiper.destroyed) return;

  swiper.params.pagination = {
    ...(typeof swiper.params.pagination === 'object' &&
    swiper.params.pagination !== null
      ? swiper.params.pagination
      : {}),
    el,
    clickable: true,
    type: 'bullets',
  };

  swiper.pagination.destroy();
  swiper.pagination.init();
  swiper.pagination.render();
  swiper.pagination.update();
}

type Props = {
  spotlights: SpotlightAnime[];
  trending: TrendingAnime[];
};

export const Preview = ({ spotlights, trending }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  /** Until Swiper binds pagination to ref, container is empty — show static bars without delay. */
  const [paginationReady, setPaginationReady] = useState(false);
  const swiperRef = useRef<SwiperType | null>(null);
  const paginationRef = useRef<HTMLDivElement | null>(null);
  /** Avoid double destroy/init on same instance; after remount (Strict Mode) instance is new — bind again. */
  const paginationBoundSwiperRef = useRef<SwiperType | null>(null);

  const attachPaginationOnce = useCallback((swiper: SwiperType, el: HTMLDivElement) => {
    if (swiper.destroyed || paginationBoundSwiperRef.current === swiper) return;
    bindHeroPagination(swiper, el);
    paginationBoundSwiperRef.current = swiper;
    setPaginationReady(true);
  }, []);

  const setPaginationNode = useCallback(
    (node: HTMLDivElement | null) => {
      paginationRef.current = node;
      if (node && swiperRef.current) {
        attachPaginationOnce(swiperRef.current, node);
      }
    },
    [attachPaginationOnce]
  );

  const handleSwiper = useCallback(
    (swiper: SwiperType) => {
      swiperRef.current = swiper;
      if (paginationRef.current) {
        attachPaginationOnce(swiper, paginationRef.current);
      }
    },
    [attachPaginationOnce]
  );

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

  const heroMetaItems = buildHeroMetaItems(currentAnime);
  const heroGenres = currentAnime.genres ?? [];
  const slideCounter =
    spotlights.length > 1 ? `${currentIndex + 1} / ${spotlights.length}` : null;

  function isAniListImage(url: string): boolean {
    return url.includes('anilist.co') || url.includes('s4.anilist.co');
  }

  function heroSlideUsesAniListSource(anime: SpotlightAnime): boolean {
    return !anime.heroImageUrl?.trim() && isAniListImage(anime.poster);
  }

  return (
    <>
      <div className="hero relative w-full">
        <div className="hero__slider">
          <button
            className="hero-zone hero--right invisible md:visible"
            aria-label="Next slide"
          >
            <ChevronRight width={46} height={46} />
          </button>
          <button
            className="hero-zone hero--left invisible md:visible"
            aria-label="Previous slide"
          >
            <ChevronLeft width={46} height={46} />
          </button>
          <Swiper
            onSwiper={handleSwiper}
            onSlideChange={(swiper) => {
              setCurrentIndex(swiper.realIndex);
            }}
            modules={[
              Navigation,
              Pagination,
              A11y,
              Autoplay,
              EffectFade,
            ]}
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
            {spotlights?.map((anime, index) => (
              <SwiperSlide key={anime.id}>
                <div className="relative h-full min-h-0 w-full">
                  <Image
                    src={spotlightHeroBackgroundUrl(anime)}
                    alt={anime.title}
                    fill
                    sizes="100vw"
                    priority={index === 0}
                    className="object-cover object-center brightness-75 contrast-110"
                    decoding="async"
                    fetchPriority={index === 0 ? 'high' : 'auto'}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    quality={index === 0 ? 95 : 90}
                    unoptimized={heroSlideUsesAniListSource(anime)}
                  />
                  <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-[40%] bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="preview__shine" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="hero__content">
            <div className="hero__info">
              <HeroSlideTitle anime={currentAnime} priority />
              <HeroSlideMeta items={heroMetaItems} />
              <HeroSlideGenres genres={heroGenres} />
              {currentAnime.description ? (
                <p className="hero__description">{currentAnime.description}</p>
              ) : (
                <p
                  className="hero__description hero__description--placeholder"
                  aria-hidden
                >
                  {'\u00a0'}
                </p>
              )}
              <HeroSlideActions animeId={currentAnime.id} />
              {spotlights.length > 1 ? (
                <div className="hero__footer">
                  {slideCounter ? (
                    <p className="hero__slide-counter" aria-live="polite">
                      {slideCounter}
                    </p>
                  ) : null}
                  <div className="hero__pagination-slot">
                    {!paginationReady && (
                      <div
                        className="hero__pagination-placeholder"
                        aria-hidden
                      >
                        {spotlights.map((s, i) => (
                          <span
                            key={s.id}
                            className={
                              i === currentIndex
                                ? 'hero-pagination-placeholder-dash hero-pagination-placeholder-dash--active'
                                : 'hero-pagination-placeholder-dash'
                            }
                          />
                        ))}
                      </div>
                    )}
                    <div
                      ref={setPaginationNode}
                      className="hero__pagination-container"
                      role="group"
                      aria-label="Spotlight slides navigation"
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <div className="relative isolate z-10 mt-[40px] flex flex-col md:mt-[-80px] lg:mt-[-120px] xl:mt-[-200px] 2xl:mt-[-260px]">
        {safeTrending.length === 0 ? (
          <EmptyState
            title="No trending anime"
            message="Please check back later."
          />
        ) : (
          <SwiperCard
            title="Trending"
            catalog={safeTrending}
            sectionId="trending"
          />
        )}
      </div>
    </>
  );
};
