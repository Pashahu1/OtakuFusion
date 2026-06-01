import '@/components/Preview/PreviewHero.scss';

import { SwiperSectionSkeleton } from './SwiperSectionSkeleton';
import './PreviewSkeleton.scss';

const PAGINATION_DASH_COUNT = 10;
const ACTIVE_PAGINATION_INDEX = 2;

export function PreviewSkeleton() {
  return (
    <>
      <div className="hero preview-skeleton relative w-full" aria-hidden>
        <div className="hero__slider preview-skeleton__slider">
          <div className="preview-skeleton__media animate-pulse" />
          <div className="preview-skeleton__media-shade" aria-hidden />
        </div>

        <div className="hero__content">
          <div className="hero__info">
            <div className="hero__title-block">
              <div className="preview-skeleton__logo animate-pulse" />
              <div className="preview-skeleton__season animate-pulse" />
            </div>

            <ul className="hero__meta-badges preview-skeleton__meta" aria-hidden>
              {Array.from({ length: 5 }).map((_, i) => (
                <li key={i} className="preview-skeleton__meta-badge animate-pulse" />
              ))}
            </ul>

            <ul className="hero__genres preview-skeleton__genres" aria-hidden>
              {Array.from({ length: 2 }).map((_, i) => (
                <li key={i} className="preview-skeleton__genre-pill animate-pulse" />
              ))}
            </ul>

            <div className="hero__description preview-skeleton__description" aria-hidden>
              <div className="preview-skeleton__desc-line animate-pulse" />
              <div className="preview-skeleton__desc-line animate-pulse" />
              <div className="preview-skeleton__desc-line preview-skeleton__desc-line--short animate-pulse" />
            </div>

            <div className="hero__actions">
              <div className="preview-skeleton__cta animate-pulse" />
            </div>

            <div className="hero__footer">
              <div className="preview-skeleton__counter animate-pulse" />
              <div className="hero__pagination-slot">
                <div className="preview-skeleton__pagination">
                  {Array.from({ length: PAGINATION_DASH_COUNT }).map((_, i) => (
                    <span
                      key={i}
                      className={
                        i === ACTIVE_PAGINATION_INDEX
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
      </div>

      <div className="hero-trending">
        <SwiperSectionSkeleton title="Trending" />
      </div>
    </>
  );
}
