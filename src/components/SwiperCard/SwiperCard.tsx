import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { Card } from '@/components/Card/Card';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import type { AnimeInfo } from '../../shared/types/GlobalTypes';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import './SwiperCard.scss';

type Props = {
  catalog: AnimeInfo[];
};

const SwiperCard = ({ catalog }: Props) => {
  return (
    <div className="relative overflow-hidden px-4 md:px-6 lg:px-10">
      <button className="nav-zone nav-zone--right" aria-label="Next slide">
        <ChevronRight />
      </button>
      <button className="nav-zone nav-zone--left" aria-label="Previous slide">
        <ChevronLeft />
      </button>

      <Swiper
        modules={[Navigation]}
        slidesPerView="auto"
        spaceBetween={20}
        navigation={{
          nextEl: '.nav-zone--right',
          prevEl: '.nav-zone--left',
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
