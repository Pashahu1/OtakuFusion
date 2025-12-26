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
// import { HandleTextSliced } from '@/helper/TextSliced';
import { useState } from 'react';

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentAnime = spotlights[currentIndex];
  return (
    <>
      <div className="relative w-full h-screen overflow-hidden bg-brand-gray-dark">
        <div className="preview__slider">
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
            navigation
            autoplay={{
              delay: 5000,
            }}
            loop={true}
          >
            {spotlights?.map((anime) => (
              <SwiperSlide key={anime.id}>
                <div className="preview__slide relative w-full h-screen select-none">
                  <Image
                    src={Convertor(anime.poster)}
                    alt={anime.title}
                    fill
                    className="object-cover object-center w-full h-full brightness-90 contrast-105"
                    decoding="async"
                    loading="eager"
                    quality={80}
                  />
                  <div className="preview__shine" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="absolute left-0 top-[10%] p-[20px] z-[2] md:top-[20%] left-[5%] lg:top-[15%] px-[20px]">
            <div className="flex flex-col gap-3 lg:gap-6 max-w-[800px] pointer-events-auto">
              <h1 className="text-display text-brand-text-primary drop-shadow-lg">
                {currentAnime.title}
              </h1>
              <p className="text-sm md:text-base lg:text-body text-brand-text-secondary landscape:md:hidden landscape:lg:block">
                {currentAnime.description}
              </p>
              <Link
                className="bg-brand-orange text-brand-gray-light px-4 py-2 rounded-md text-lg font-medium transition-colors w-full md:w-[300px] lg:hover:bg-brand-orange-light hover:text-brand-gray  text-center text-title"
                href={`/watch/${currentAnime.id}`}
              >
                Watch Ep 1
              </Link>
              <div className="preview__pagination" />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-[20px] relative px-[20px] mb-[40px] z-[3] mt-[0px] md:mt-[-60px] lg:mt-[-120px] xl:mt-[-200px] 2xl:mt-[-260px]">
        <h2 className="text-title text-brand-text-primary">Trending</h2>
        <div className="preview__trending-container">
          <LazySwiperCard catalog={trending || []} />
        </div>
      </div>
    </>
  );
};
export default Preview;
