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
import type { ContinueWatchingEntry } from '@/shared/types/ContinueWatchingEntry';

const STORAGE_KEY = 'continueWatching';
const MAX_ITEMS = 12;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Легка валідація без Zod — інакше ~90 KiB zod у клієнтському чанку головної (TBT). */
function parseContinueWatchingList(
  raw: string | null
): ContinueWatchingEntry[] {
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];

    const valid: ContinueWatchingEntry[] = [];
    for (const item of parsed) {
      if (!isRecord(item)) continue;

      const id = item.id;
      const episodeId = item.episodeId;
      if (typeof id !== 'string' || id === '' || typeof episodeId !== 'string' || episodeId === '') {
        continue;
      }

      const rawDataId = item.data_id;
      const data_id =
        typeof rawDataId === 'number'
          ? rawDataId
          : typeof rawDataId === 'string'
            ? Number(rawDataId)
            : NaN;
      if (!Number.isFinite(data_id)) continue;

      const episodeNum =
        typeof item.episodeNum === 'number' ? item.episodeNum : undefined;

      valid.push({
        id,
        data_id,
        episodeId,
        episodeNum,
        poster: typeof item.poster === 'string' ? item.poster : undefined,
        title: typeof item.title === 'string' ? item.title : undefined,
        japanese_title:
          typeof item.japanese_title === 'string'
            ? item.japanese_title
            : undefined,
        adultContent:
          typeof item.adultContent === 'boolean' ? item.adultContent : undefined,
      });
    }
    return valid.slice(-MAX_ITEMS).reverse();
  } catch {
    return [];
  }
}

export function ContinueWatchingSection() {
  const [list, setList] = useState<ContinueWatchingEntry[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setList(parseContinueWatchingList(localStorage.getItem(STORAGE_KEY)));
  }, []);

  if (list.length === 0) return null;

  return (
    <section className="w-full py-8">
      <div className="mb-4 flex items-center justify-between px-4 md:px-6 lg:px-10">
        <h2 className="text-title text-brand-text-primary">
          Continue watching
        </h2>
      </div>
      <div className="relative overflow-hidden pr-4 pl-4 md:pr-6 md:pl-6 lg:pr-10 lg:pl-10">
        <button
          type="button"
          className="continue-watching-nav continue-watching-nav--left"
          aria-label="Previous"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          type="button"
          className="continue-watching-nav continue-watching-nav--right"
          aria-label="Next"
        >
          <ChevronRight className="h-6 w-6" />
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
              className="!w-[130px] shrink-0 sm:!w-[150px] md:!w-[160px]"
            >
              <Link
                href={`/watch/${item.id}?ep=${item.episodeId}`}
                className="group block"
              >
                <article className="relative flex w-full flex-col gap-1.5 overflow-hidden rounded-md transition duration-300 hover:scale-[1.04] hover:shadow-lg">
                  <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md">
                    <Image
                      src={
                        item.poster
                          ? Convertor(item.poster)
                          : '/sukuna-error.jpg'
                      }
                      alt={item.title || item.japanese_title || 'Anime'}
                      fill
                      quality={70}
                      className="object-cover object-center transition duration-300 group-hover:brightness-110"
                      sizes="(max-width: 640px) 130px, (max-width: 768px) 150px, 160px"
                    />
                    <div className="absolute inset-0 bg-white/0 transition duration-300 group-hover:bg-white/10" />
                    <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/90 to-transparent px-1.5 py-1">
                      <span className="text-[11px] font-medium text-white/90 sm:text-xs">
                        Ep. {item.episodeNum ?? item.episodeId}
                      </span>
                    </div>
                    {item.adultContent && (
                      <div className="absolute top-1 left-1 rounded bg-red-700 px-1.5 py-[1px] text-[10px] font-bold text-white">
                        +18
                      </div>
                    )}
                  </div>
                  <h3 className="text-brand-text-primary line-clamp-2 px-0.5 text-xs font-medium">
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
