import { AnimeCardSkeleton } from './AnimeCardSkeleton';
import './SwiperSectionSkeleton.scss';

interface SwiperSectionSkeletonProps {
  title?: string;
  slideCount?: number;
  showViewAll?: boolean;
  className?: string;
}

export function SwiperSectionSkeleton({
  title,
  slideCount = 6,
  showViewAll = false,
  className = '',
}: SwiperSectionSkeletonProps) {
  return (
    <div
      className={`swiper-section-skeleton px-4 md:px-6 lg:px-10 ${className}`.trim()}
      aria-hidden
    >
      <div className="swiper-section-skeleton__header">
        {title ? (
          <div className="swiper-section-skeleton__title animate-pulse" aria-hidden />
        ) : (
          <span />
        )}
        {showViewAll ? (
          <div className="swiper-section-skeleton__view-all animate-pulse" aria-hidden />
        ) : null}
      </div>
      <div className="swiper-section-skeleton__row">
        {Array.from({ length: slideCount }).map((_, i) => (
          <div key={i} className="swiper-section-skeleton__slide">
            <AnimeCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}
