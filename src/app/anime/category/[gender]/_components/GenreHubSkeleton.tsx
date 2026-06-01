import { SwiperSectionSkeleton } from '@/components/ui/Skeleton/SwiperSectionSkeleton';
import { GENRE_HUB_SECTIONS } from '@/shared/data/genre-hub';
import '@/components/genre-hub/GenreHubHeader.scss';

export function GenreHubSkeleton() {
  return (
    <div className="mt-[80px] pb-16" aria-hidden>
      <header className="genre-hub-header">
        <div className="genre-hub-header__icon-wrap">
          <div className="h-7 w-7 animate-pulse rounded-full bg-white/10" />
        </div>
        <div className="mx-auto h-9 w-40 max-w-[12rem] animate-pulse rounded bg-white/10" />
        <div className="mx-auto h-4 w-full max-w-md animate-pulse rounded bg-white/5" />
        <div className="mx-auto mt-1 h-4 w-[85%] max-w-sm animate-pulse rounded bg-white/5" />
      </header>
      <div className="home-feed flex w-full flex-col gap-8 pt-6 md:gap-10 md:pt-8 lg:gap-10">
        {GENRE_HUB_SECTIONS.map((section) => (
          <SwiperSectionSkeleton
            key={section.id}
            title={section.label}
            showViewAll
          />
        ))}
      </div>
    </div>
  );
}
