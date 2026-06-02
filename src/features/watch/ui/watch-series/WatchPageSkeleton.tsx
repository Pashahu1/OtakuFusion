import { SwiperSectionSkeleton } from '@/components/ui/Skeleton/SwiperSectionSkeleton';
import { WatchEpisodesSkeleton } from './WatchEpisodesSkeleton';
import './WatchPageSkeleton.scss';

export function WatchPageSkeleton() {
  return (
    <div className="watch-page-skeleton" aria-busy aria-label="Loading series">
      <div className="watch-page-skeleton__hero" />
      <WatchEpisodesSkeleton />
      <div className="watch-page-skeleton__recommended">
        <SwiperSectionSkeleton title="Recommended for you" />
      </div>
    </div>
  );
}
