'use client';

import Link from 'next/link';
import { useId, useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { Card } from '@/components/Card/Card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { SwiperCardProps } from '@/shared/types/SwiperCardProps';

import 'swiper/css';
import 'swiper/css/navigation';
import './SwiperCard.scss';
import {
  ANIME_CAROUSEL_POSTER_QUALITY,
  ANIME_CAROUSEL_POSTER_SIZES,
} from '@/lib/anime-card-poster';

/** Must match gap in SwiperCard.scss until `swiper-initialized`. */
const SPACING_BETWEEN_SLIDES = 20;

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export function SwiperCard({
  title,
  catalog,
  sectionId,
  viewAllHref,
}: SwiperCardProps) {
  const reactId = useId().replace(/:/g, '');
  const slug = sectionId ? slugify(sectionId) : '';
  const id = sectionId && slug.length > 0 ? `${slug}-${reactId}` : reactId;
  const prevId = `swiper-prev-${id}`;
  const nextId = `swiper-next-${id}`;

  const navigation = useMemo(
    () => ({
      nextEl: `#${nextId}`,
      prevEl: `#${prevId}`,
    }),
    [nextId, prevId]
  );

  if (catalog.length === 0) {
    return null;
  }

  return (
    <div className="swiper-card relative overflow-hidden px-4 md:px-6 lg:px-10">
      <div className="mb-4 flex items-center justify-between gap-4">
        {title ? (
          <h2 className="text-title text-brand-text-primary">{title}</h2>
        ) : (
          <span />
        )}
        {viewAllHref ? (
          <Link
            href={viewAllHref}
            className="shrink-0 text-xs font-semibold uppercase tracking-[0.14em] text-white/65 transition-colors hover:text-brand-orange"
          >
            View all
          </Link>
        ) : null}
      </div>
      <div className="swiper-card__viewport">
        <div
          className="swiper-card__edge-fade swiper-card__edge-fade--left"
          aria-hidden
        />
        <div
          className="swiper-card__edge-fade swiper-card__edge-fade--right"
          aria-hidden
        />
        <button
          type="button"
          id={nextId}
          className="nav-zone nav-zone--right"
          aria-label="Next slide"
        >
          <ChevronRight strokeWidth={2} aria-hidden />
        </button>
        <button
          type="button"
          id={prevId}
          className="nav-zone nav-zone--left"
          aria-label="Previous slide"
        >
          <ChevronLeft strokeWidth={2} aria-hidden />
        </button>

        <Swiper
          modules={[Navigation]}
          slidesPerView="auto"
          spaceBetween={SPACING_BETWEEN_SLIDES}
          navigation={navigation}
        >
          {catalog.map((anime) => (
            <SwiperSlide className="swiper-card__slide" key={anime.id}>
              <Card
                anime={anime}
                posterSizes={ANIME_CAROUSEL_POSTER_SIZES}
                posterQuality={ANIME_CAROUSEL_POSTER_QUALITY}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
