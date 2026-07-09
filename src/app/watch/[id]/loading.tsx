import { WatchPageSkeleton } from '@/features/watch/ui/watch-series/WatchPageSkeleton';
import './watch-page.scss';

export default function WatchSeriesLoading() {
  return (
    <div className="watch-page">
      <WatchPageSkeleton />
    </div>
  );
}
