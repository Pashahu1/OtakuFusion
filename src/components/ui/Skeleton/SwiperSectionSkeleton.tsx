import { AnimeCardSkeleton } from './AnimeCardSkeleton';
import { CAROUSEL_SKELETON_SLIDE_COUNT } from './skeleton-counts';
import './SwiperSectionSkeleton.scss';

interface SwiperSectionSkeletonProps {
  title?: string;
  slideCount?: number;
  showViewAll?: boolean;
  className?: string;
}

export function SwiperSectionSkeleton({
  title,
  slideCount = CAROUSEL_SKELETON_SLIDE_COUNT,
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
          <div className="swiper-section-skeleton__title" aria-hidden />
        ) : (
          <span />
        )}
        {showViewAll ? (
          <div className="swiper-section-skeleton__view-all" aria-hidden />
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
