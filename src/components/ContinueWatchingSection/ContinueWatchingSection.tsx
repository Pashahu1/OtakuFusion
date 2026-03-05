'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Convertor } from '@/helper/Convertor';

import 'swiper/css';
import 'swiper/css/navigation';
import './ContinueWatchingSection.scss';

export type ContinueWatchingEntry = {
  id: string;
  data_id: number;
  episodeId: string;
  episodeNum?: number;
  poster?: string;
  title?: string;
  japanese_title?: string;
  adultContent?: boolean;
};

const STORAGE_KEY = 'continueWatching';
const MAX_ITEMS = 12;

export function ContinueWatchingSection() {
  const [list, setList] = useState<ContinueWatchingEntry[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed: ContinueWatchingEntry[] = raw ? JSON.parse(raw) : [];
      const valid = Array.isArray(parsed)
        ? parsed.filter(
            (item) =>
              item &&
              typeof item.id === 'string' &&
              item.id &&
              typeof item.episodeId === 'string' &&
              item.episodeId
          )
        : [];
      setList(valid.slice(-MAX_ITEMS).reverse());
    } catch {
      setList([]);
    }
  }, []);

  if (list.length === 0) return null;

  return (
    <section className="w-full py-8">
      <div className="flex items-center justify-between mb-4 px-4 md:px-6 lg:px-10">
        <h2 className="text-title text-brand-text-primary">
          Continue watching
        </h2>
      </div>
      <div className="relative overflow-hidden pl-4 pr-4 md:pl-6 md:pr-6 lg:pl-10 lg:pr-10">
        <button
          type="button"
          className="continue-watching-nav continue-watching-nav--left"
          aria-label="Previous"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          type="button"
          className="continue-watching-nav continue-watching-nav--right"
          aria-label="Next"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
        <Swiper
          modules={[Navigation]}
          slidesPerView="auto"
          spaceBetween={12}
          navigation={{
            nextEl: '.continue-watching-nav--right',
            prevEl: '.continue-watching-nav--left',
          }}
          className="!overflow-visible"
        >
          {list.map((item) => (
            <SwiperSlide
              key={`${item.id}-${item.episodeId}`}
              className="!w-[130px] sm:!w-[150px] md:!w-[160px] shrink-0"
            >
              <Link href={`/watch/${item.id}?ep=${item.episodeId}`} className="block group">
                <article className="relative flex flex-col w-full gap-1.5 transition duration-300 hover:scale-[1.04] hover:shadow-lg rounded-md overflow-hidden">
                  <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md">
                    <Image
                      src={
                        item.poster
                          ? Convertor(item.poster)
                          : '/sukuna-error.jpg'
                      }
                      alt={item.title || item.japanese_title || 'Anime'}
                      fill
                      className="object-cover object-center transition duration-300 group-hover:brightness-110"
                      sizes="160px"
                    />
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-1.5 py-1">
                      <span className="text-[11px] font-medium text-white/90 sm:text-xs">
                        Ep. {item.episodeNum ?? item.episodeId}
                      </span>
                    </div>
                    {item.adultContent && (
                      <div className="absolute top-1 left-1 bg-red-600 text-black px-1.5 py-[1px] rounded text-[10px] font-bold">
                        +18
                      </div>
                    )}
                  </div>
                  <h3 className="text-xs font-medium text-brand-text-primary line-clamp-2 px-0.5">
                    {item.title || item.japanese_title || 'Anime'}
                  </h3>
                </article>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
