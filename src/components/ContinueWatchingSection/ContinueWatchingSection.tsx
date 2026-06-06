'use client';

import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  CONTINUE_WATCHING_STORAGE_KEY,
  parseContinueWatchingList,
} from '@/features/watch/lib/continue-watching-list';

import 'swiper/css';
import 'swiper/css/navigation';
import './ContinueWatchingSection.scss';
import type { ContinueWatchingEntry } from '@/shared/types/ContinueWatchingEntry';
import { ContinueWatchingCard } from './ContinueWatchingCard';

const STORAGE_KEY = CONTINUE_WATCHING_STORAGE_KEY;
/** Must match gap in ContinueWatchingSection.scss until `swiper-initialized`. */
const SPACE_BETWEEN_SLIDES = 12;

export function ContinueWatchingSection() {
  const [list, setList] = useState<ContinueWatchingEntry[]>([]);
  const reactId = useId().replace(/:/g, '');
  const prevNavId = `cw-swiper-prev-${reactId}`;
  const nextNavId = `cw-swiper-next-${reactId}`;
  const navigation = useMemo(
    () => ({
      prevEl: `#${prevNavId}`,
      nextEl: `#${nextNavId}`,
    }),
    [prevNavId, nextNavId],
  );

  const refreshList = useCallback(() => {
    if (typeof window === 'undefined') return;
    setList(parseContinueWatchingList(localStorage.getItem(STORAGE_KEY)));
  }, []);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) refreshList();
    });
    window.addEventListener('continueWatchingUpdated', refreshList);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY || e.key === null) refreshList();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      cancelled = true;
      window.removeEventListener('continueWatchingUpdated', refreshList);
      window.removeEventListener('storage', onStorage);
    };
  }, [refreshList]);

  if (list.length === 0) return null;

  return (
    <section className="continue-watching-section w-full px-4 md:px-6 lg:px-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-title text-brand-text-primary">Continue watching</h2>
      </div>
      <div className="continue-watching-slider relative overflow-hidden">
        <button
          id={nextNavId}
          type="button"
          className="continue-watching-nav continue-watching-nav--right"
          aria-label="Next"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
        <button
          id={prevNavId}
          type="button"
          className="continue-watching-nav continue-watching-nav--left"
          aria-label="Previous"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <Swiper
          modules={[Navigation]}
          slidesPerView="auto"
          spaceBetween={SPACE_BETWEEN_SLIDES}
          grabCursor
          watchOverflow
          navigation={navigation}
          className="continue-watching-swiper"
        >
          {list.map((item) => (
            <SwiperSlide
              key={`${item.id}-${item.episodeId}`}
              className="!w-[200px] shrink-0 sm:!w-[220px] md:!w-[240px]"
            >
              <ContinueWatchingCard item={item} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
