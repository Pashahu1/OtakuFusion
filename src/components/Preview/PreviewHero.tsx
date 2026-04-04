'use client';
import {
  A11y,
  Navigation,
  Pagination,
  Autoplay,
} from 'swiper/modules';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Convertor } from '@/helper/Convertor';
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
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { EmptyState } from '../ui/states/EmptyState';
import { SwiperCard } from '../SwiperCard/SwiperCard';

/** Кастомний `el` для pagination монтується після Swiper — прив’язуємо після init без remount (див. Swiper + React: custom pagination). */
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
  /** Доки Swiper не прив’язав pagination до ref, контейнер порожній — показуємо статичні «смужки» без затримки. */
  const [paginationReady, setPaginationReady] = useState(false);
  const swiperRef = useRef<SwiperType | null>(null);
  const paginationRef = useRef<HTMLDivElement | null>(null);
  /** Уникаємо подвійного destroy/init на тому ж інстансі; після remount (Strict Mode) інстанс новий — прив’язка повториться. */
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

  const tv = currentAnime.tvInfo;
  const metaParts: string[] = [];
  if (tv?.sub && tv?.dub) metaParts.push('Sub | Dub');
  else if (tv?.sub) metaParts.push('Sub');
  else if (tv?.dub) metaParts.push('Dub');
  if (tv?.showType || tv?.duration) {
    metaParts.push([tv?.showType, tv?.duration].filter(Boolean).join(' • '));
  }
  const metaLine = metaParts.join(' • ');

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
                    src={Convertor(anime.poster)}
                    alt={anime.title}
                    fill
                    sizes="100vw"
                    priority={index === 0}
                    className="object-cover object-center brightness-75 contrast-110"
                    decoding="async"
                    fetchPriority={index === 0 ? 'high' : 'auto'}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    /* LCP: перший кадр ще прийнятний візуально; інші слайди — мінімум байтів (fade не показує їх одразу) */
                    quality={index === 0 ? 58 : 52}
                  />
                  <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-[40%] bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="preview__shine" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="hero__content">
            <div className="hero__info">
              <h1 className="hero__title">{currentAnime.title}</h1>
              {metaLine && (
                <p className="hero__meta" aria-hidden>
                  {metaLine}
                </p>
              )}
              {currentAnime.description && (
                <p className="hero__description">{currentAnime.description}</p>
              )}
              <Link
                className="hero__cta bg-brand-orange text-brand-gray-light hover:bg-brand-orange-light hover:text-brand-gray w-full max-w-[300px] rounded-md px-4 py-3 text-center text-base font-medium transition-colors md:py-2.5"
                href={`/watch/${currentAnime.id}?ep=1`}
              >
                <Play className="h-5 w-5 shrink-0 fill-current" />
                Watch Ep 1
              </Link>
            </div>
            {/* Під текстом у колонці .hero__content; слот з min-height — без стрибка при mount Swiper */}
            <div className="hero__pagination-slot">
              {/* До init Swiper лише placeholder; після bind — лише контейнер Swiper (інакше два ряди смужок) */}
              {!paginationReady && (
                <div className="hero__pagination-placeholder" aria-hidden>
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
                aria-hidden
              />
            </div>
          </div>
        </div>
      </div>
      <div className="relative isolate z-10 mt-[40px] flex flex-col gap-[20px] md:mt-[-80px] lg:mt-[-120px] xl:mt-[-200px] 2xl:mt-[-260px]">
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
