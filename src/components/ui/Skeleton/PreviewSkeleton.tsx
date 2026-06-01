import { SwiperSectionSkeleton } from './SwiperSectionSkeleton';
import './PreviewSkeleton.scss';

export function PreviewSkeleton() {
  return (
    <>
      <div className="hero preview-skeleton relative w-full" aria-hidden>
        <div className="preview-skeleton__media animate-pulse" />
        <div className="hero__content">
          <div className="hero__info">
            <div className="hero__title-block">
              <div className="preview-skeleton__title animate-pulse" />
            </div>
            <div className="preview-skeleton__meta">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="preview-skeleton__meta-pill animate-pulse"
                />
              ))}
            </div>
            <div className="preview-skeleton__genres">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="preview-skeleton__genre-pill animate-pulse"
                />
              ))}
            </div>
            <div className="preview-skeleton__description">
              <div className="preview-skeleton__desc-line animate-pulse" />
              <div className="preview-skeleton__desc-line animate-pulse" />
              <div className="preview-skeleton__desc-line preview-skeleton__desc-line--short animate-pulse" />
            </div>
            <div className="hero__actions">
              <div className="preview-skeleton__cta animate-pulse" />
            </div>
            <div className="preview-skeleton__footer">
              <div className="preview-skeleton__counter animate-pulse" />
              <div className="preview-skeleton__pagination">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={
                      i === 0
                        ? 'preview-skeleton__pagination-dash preview-skeleton__pagination-dash--active animate-pulse'
                        : 'preview-skeleton__pagination-dash animate-pulse'
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="hero-trending">
        <SwiperSectionSkeleton title="Trending" />
      </div>
    </>
  );
}
