import { useCallback, useRef, useState } from 'react';
import type { Swiper as SwiperType } from 'swiper';

export function bindHeroPagination(swiper: SwiperType, el: HTMLDivElement | null) {
  if (!el || swiper.destroyed) return;

  swiper.params.pagination = {
    ...(typeof swiper.params.pagination === 'object' && swiper.params.pagination !== null
      ? swiper.params.pagination
      : {}),
    el,
    clickable: true,
    type: 'bullets',
  };

  swiper.pagination.destroy();
  swiper.pagination.init();
  swiper.pagination.render();
  swiper.pagination.update();
}

/** Custom pagination mounts after Swiper — bind once per instance. */
export function useHeroPagination() {
  const [paginationReady, setPaginationReady] = useState(false);
  const swiperRef = useRef<SwiperType | null>(null);
  const paginationRef = useRef<HTMLDivElement | null>(null);
  const paginationBoundSwiperRef = useRef<SwiperType | null>(null);

  const attachPaginationOnce = useCallback((swiper: SwiperType, el: HTMLDivElement) => {
    if (swiper.destroyed || paginationBoundSwiperRef.current === swiper) return;
    bindHeroPagination(swiper, el);
    paginationBoundSwiperRef.current = swiper;
    setPaginationReady(true);
  }, []);

  const setPaginationNode = useCallback(
    (node: HTMLDivElement | null) => {
      paginationRef.current = node;
      if (node && swiperRef.current) {
        attachPaginationOnce(swiperRef.current, node);
      }
    },
    [attachPaginationOnce]
  );

  const handleSwiper = useCallback(
    (swiper: SwiperType) => {
      swiperRef.current = swiper;
      if (paginationRef.current) {
        attachPaginationOnce(swiper, paginationRef.current);
      }
    },
    [attachPaginationOnce]
  );

  return {
    paginationReady,
    setPaginationNode,
    handleSwiper,
  };
}
