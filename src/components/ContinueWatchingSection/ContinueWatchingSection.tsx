'use client';

import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { thumbnailUrl, LIST_THUMBNAIL_RES } from '@/shared/utils/thumbnail-url';
import {
  CONTINUE_WATCHING_STORAGE_KEY,
  parseContinueWatchingList,
} from '@/features/watch/lib/continue-watching-list';
import {
  continueWatchingEpisodeParam,
  continueWatchingProgressRatio,
  continueWatchingTimeLeftLabel,
} from '@/features/watch/lib/continue-watching-display';
import { watchPlayPath } from '@/shared/utils/watch-routes';

import 'swiper/css';
import 'swiper/css/navigation';
import './ContinueWatchingSection.scss';
import type { ContinueWatchingEntry } from '@/shared/types/ContinueWatchingEntry';

const STORAGE_KEY = CONTINUE_WATCHING_STORAGE_KEY;
/** Must match gap in ContinueWatchingSection.scss until `swiper-initialized`. */
const SPACE_BETWEEN_SLIDES = 12;
const FALLBACK_POSTER_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='900' viewBox='0 0 600 900'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0%25' stop-color='%23111827'/%3E%3Cstop offset='55%25' stop-color='%230b1220'/%3E%3Cstop offset='100%25' stop-color='%2303070d'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='600' height='900' fill='url(%23g)'/%3E%3Ccircle cx='300' cy='410' r='118' fill='none' stroke='%23334155' stroke-width='20'/%3E%3Cpath d='M165 700c33-92 102-137 135-137s102 45 135 137' fill='none' stroke='%23334155' stroke-width='20' stroke-linecap='round'/%3E%3C/svg%3E";

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
          {list.map((item) => {
            const epParam = continueWatchingEpisodeParam(item);
            const progress = continueWatchingProgressRatio(
              item.positionSeconds,
              item.durationSeconds,
            );
            const timeLeft = continueWatchingTimeLeftLabel(
              item.positionSeconds,
              item.durationSeconds,
            );

            return (
              <SwiperSlide
                key={`${item.id}-${item.episodeId}`}
                className="!w-[200px] shrink-0 sm:!w-[220px] md:!w-[240px]"
              >
                <Link
                  href={watchPlayPath(item.id, epParam)}
                  className="continue-watching-card group block"
                >
                  <article className="continue-watching-card__inner">
                    <div className="continue-watching-card__thumb">
                      <Image
                        src={
                          item.poster
                            ? thumbnailUrl(item.poster, LIST_THUMBNAIL_RES)
                            : FALLBACK_POSTER_SRC
                        }
                        alt={item.title || item.japanese_title || 'Anime'}
                        fill
                        quality={92}
                        onError={(event) => {
                          event.currentTarget.src = FALLBACK_POSTER_SRC;
                        }}
                        className="object-cover object-center transition duration-300 group-hover:brightness-110"
                        sizes="(max-width: 640px) 200px, (max-width: 768px) 220px, 240px"
                      />
                      <div className="continue-watching-card__play" aria-hidden>
                        <Play className="h-7 w-7 fill-white text-white" />
                      </div>
                      {progress > 0 ? (
                        <div
                          className="continue-watching-card__progress"
                          style={{ width: `${progress * 100}%` }}
                        />
                      ) : null}
                      {timeLeft ? (
                        <span className="continue-watching-card__time-left">{timeLeft}</span>
                      ) : null}
                      {item.adultContent ? (
                        <div className="continue-watching-card__adult">+18</div>
                      ) : null}
                    </div>
                    <div className="continue-watching-card__meta">
                      <p className="continue-watching-card__series">
                        {item.title || item.japanese_title || 'Anime'}
                      </p>
                      <p className="continue-watching-card__episode">E{epParam}</p>
                    </div>
                  </article>
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
}
