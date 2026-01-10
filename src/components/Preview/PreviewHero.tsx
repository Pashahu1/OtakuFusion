'use client';
import {
  A11y,
  Navigation,
  Pagination,
  Scrollbar,
  Autoplay,
} from 'swiper/modules';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Convertor } from '@/helper/Convertor';
import 'swiper/css/effect-fade';
import { EffectFade } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import './PreviewHero.scss';
import Image from 'next/image';
import type { SpotlightAnime, TrendingAnime } from '@/shared/types/GlobalTypes';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import EmptyState from '../ui/states/EmptyState';

const LazySwiperCard = dynamic(
  () => import('@/components/SwiperCard/SwiperCard'),
  {
    ssr: false,
  }
);

type Props = {
  spotlights: SpotlightAnime[];
  trending: TrendingAnime[];
};

const Preview = ({ spotlights, trending }: Props) => {
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentAnime = spotlights[currentIndex];

  return (
    <>
      <div className="relative w-full overflow-hidden hero">
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
            onSlideChange={(swiper) => {
              setCurrentIndex(swiper.realIndex);
            }}
            modules={[
              Navigation,
              Pagination,
              Scrollbar,
              A11y,
              Autoplay,
              EffectFade,
            ]}
            slidesPerView={1}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            pagination={{
              el: '.preview__pagination',
              clickable: true,
            }}
            navigation={{
              nextEl: '.hero--right',
              prevEl: '.hero--left',
            }}
            autoplay={{
              delay: 5000,
            }}
            loop={true}
          >
            {spotlights?.map((anime) => (
              <SwiperSlide key={anime.id}>
                <div className="relative w-full h-full">
                  <Image
                    src={Convertor(anime.poster)}
                    alt={anime.title}
                    fill
                    className="object-cover object-center w-full h-[900px] brightness-75 contrast-110"
                    decoding="async"
                    loading="eager"
                    quality={80}
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                  <div className="preview__shine" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="hero__content">
            <div className="hero__info">
              <h1 className="text-display text-brand-text-primary drop-shadow-lg">
                {currentAnime.title}
              </h1>
              <p className="text-sm md:text-base lg:text-body text-brand-text-secondary landscape:md:hidden landscape:lg:block">
                {currentAnime.description}
              </p>
              <Link
                className="bg-brand-orange text-brand-gray-light px-4 py-2 rounded-md text-lg font-medium transition-colors w-full md:w-[300px] lg:hover:bg-brand-orange-light hover:text-brand-gray text-center text-title"
                href={`/watch/${currentAnime.id}`}
              >
                Watch Ep 1
              </Link>
              <div className="preview__pagination justify-center md:justify-start" />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-[20px] relative z-[3] mt-[40px] md:mt-[-60px] lg:mt-[-120px] xl:mt-[-200px] 2xl:mt-[-260px]">
        <h2 className="text-title text-brand-text-primary pl-4 md:pl-6 lg:pl-10">
          Trending
        </h2>
        {safeTrending.length === 0 ? (
          <EmptyState
            title="No trending anime"
            message="Please check back later."
          />
        ) : (
          <LazySwiperCard catalog={safeTrending} />
        )}
      </div>
    </>
  );
};
export default Preview;
