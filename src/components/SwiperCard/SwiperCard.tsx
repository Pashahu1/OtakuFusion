'use client';

import { useId, useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { Card } from '@/components/Card/Card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { SwiperCardProps } from '@/shared/types/SwiperCardProps ';

import 'swiper/css';
import 'swiper/css/navigation';
import './SwiperCard.scss';

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export function SwiperCard({ title, catalog, sectionId }: SwiperCardProps) {
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
      <div className="mb-4 flex items-center justify-between">
        {title && (
          <h2 className="text-title text-brand-text-primary">{title}</h2>
        )}
      </div>
      <button
        type="button"
        id={nextId}
        className="nav-zone nav-zone--right"
        aria-label="Next slide"
      >
        <ChevronRight />
      </button>
      <button
        type="button"
        id={prevId}
        className="nav-zone nav-zone--left"
        aria-label="Previous slide"
      >
        <ChevronLeft />
      </button>

      <Swiper
        modules={[Navigation]}
        slidesPerView="auto"
        spaceBetween={20}
        navigation={navigation}
      >
        {catalog.map((anime) => (
          <SwiperSlide className="swiper-card__slide" key={anime.id}>
            <Card anime={anime} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
