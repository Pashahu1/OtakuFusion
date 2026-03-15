'use client';

import { useId } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { Card } from '@/components/Card/Card';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import type { AnimeInfo } from '../../shared/types/GlobalAnimeTypes';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import './SwiperCard.scss';

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

type Props = {
  catalog: AnimeInfo[];
  sectionId?: string;
};

const SwiperCard = ({ catalog, sectionId }: Props) => {
  const reactId = useId().replace(/:/g, '');
  const id = sectionId ? slugify(sectionId) : reactId;
  const prevId = `swiper-prev-${id}`;
  const nextId = `swiper-next-${id}`;

  return (
    <div className="relative overflow-hidden px-4 md:px-6 lg:px-10">
      <button
        id={nextId}
        className="nav-zone nav-zone--right"
        aria-label="Next slide"
      >
        <ChevronRight />
      </button>
      <button
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
        navigation={{
          nextEl: `#${nextId}`,
          prevEl: `#${prevId}`,
        }}
      >
        {catalog.map((anime: AnimeInfo, idx) => (
          <SwiperSlide className="swiper-card__slide" key={idx}>
            <Card anime={anime} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};
export default SwiperCard;
