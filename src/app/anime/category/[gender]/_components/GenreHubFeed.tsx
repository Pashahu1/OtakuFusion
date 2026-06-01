'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

import { SwiperSectionSkeleton } from '@/components/ui/Skeleton/SwiperSectionSkeleton';
import type { SwiperCardProps } from '@/shared/types/SwiperCardProps';
import {
  GENRE_HUB_SECTIONS,
  type GenreHubSectionConfig,
} from '@/shared/data/genre-hub';
import type { AnimeInfo } from '@/shared/types/GlobalAnimeTypes';
import { genreBrowsePath } from '@/shared/utils/genre-slug';

const SwiperCard = dynamic(
  () => import('@/components/SwiperCard/SwiperCard').then((m) => m.SwiperCard),
  {
    ssr: false,
    loading: () => <SwiperSectionSkeleton />,
  },
);

const FIRST_CAROUSEL_PRIORITY_SLIDES = 4;

interface LazySwiperRowProps extends SwiperCardProps {
  mountImmediately?: boolean;
}

function LazySwiperRow({
  mountImmediately = false,
  title,
  viewAllHref,
  ...swiperProps
}: LazySwiperRowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(mountImmediately);

  useEffect(() => {
    if (isMounted) return;
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setIsMounted(true);
        observer.disconnect();
      },
      { rootMargin: '280px 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isMounted]);

  return (
    <div ref={containerRef}>
      {isMounted ? (
        <SwiperCard title={title} viewAllHref={viewAllHref} {...swiperProps} />
      ) : (
        <SwiperSectionSkeleton title={title} showViewAll={Boolean(viewAllHref)} />
      )}
    </div>
  );
}

interface GenreHubFeedProps {
  genre: string;
  sections: Partial<Record<GenreHubSectionConfig['id'], AnimeInfo[]>>;
}

export function GenreHubFeed({ genre, sections }: GenreHubFeedProps) {
  let visibleSectionIndex = 0;

  return (
    <div className="home-feed flex w-full flex-col gap-8 pt-6 md:gap-10 md:pt-8 lg:gap-10">
      {GENRE_HUB_SECTIONS.map((section) => {
        const catalog = sections[section.id] ?? [];
        if (!catalog.length) return null;

        const sectionIndex = visibleSectionIndex;
        visibleSectionIndex += 1;

        const swiperProps: SwiperCardProps = {
          title: section.label,
          catalog,
          sectionId: `genre-${section.id}`,
          viewAllHref: genreBrowsePath(genre, section.id),
          prioritySlideCount:
            sectionIndex === 0 ? FIRST_CAROUSEL_PRIORITY_SLIDES : 0,
        };

        return (
          <LazySwiperRow
            key={section.id}
            mountImmediately={sectionIndex === 0}
            {...swiperProps}
          />
        );
      })}
    </div>
  );
}
