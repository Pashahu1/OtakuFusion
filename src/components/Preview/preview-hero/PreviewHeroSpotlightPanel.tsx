'use client';

import type { SpotlightAnime } from '@/shared/types/GlobalAnimeTypes';
import { buildHeroMetaItems } from '../hero-slide-meta';
import { HeroSlideActions } from '../HeroSlideActions';
import { HeroSlideGenres } from '../HeroSlideGenres';
import { HeroSlideMeta } from '../HeroSlideMeta';
import { HeroSlideTitle } from '../HeroSlideTitle';

interface PreviewHeroSpotlightPanelProps {
  anime: SpotlightAnime;
  spotlights: SpotlightAnime[];
  currentIndex: number;
  paginationReady: boolean;
  setPaginationNode: (node: HTMLDivElement | null) => void;
}

export function PreviewHeroSpotlightPanel({
  anime,
  spotlights,
  currentIndex,
  paginationReady,
  setPaginationNode,
}: PreviewHeroSpotlightPanelProps) {
  const heroMetaItems = buildHeroMetaItems(anime);
  const heroGenres = anime.genres ?? [];
  const slideCounter =
    spotlights.length > 1 ? `${currentIndex + 1} / ${spotlights.length}` : null;

  return (
    <div className="hero__content">
      <div className="hero__info">
        <HeroSlideTitle anime={anime} priority />
        <HeroSlideMeta items={heroMetaItems} />
        <HeroSlideGenres genres={heroGenres} />
        {anime.description ? (
          <p className="hero__description">{anime.description}</p>
        ) : (
          <p className="hero__description hero__description--placeholder" aria-hidden>
            {'\u00a0'}
          </p>
        )}
        <HeroSlideActions animeId={anime.id} />
        {spotlights.length > 1 ? (
          <div className="hero__footer">
            {slideCounter ? (
              <p className="hero__slide-counter" aria-live="polite">
                {slideCounter}
              </p>
            ) : null}
            <div className="hero__pagination-slot">
              {!paginationReady && (
                <div className="hero__pagination-placeholder" aria-hidden>
                  {spotlights.map((s, i) => (
                    <span
                      key={s.id}
                      className={
                        i === currentIndex
                          ? 'hero-pagination-placeholder-dash hero-pagination-placeholder-dash--active'
                          : 'hero-pagination-placeholder-dash'
                      }
                    />
                  ))}
                </div>
              )}
              <div
                ref={setPaginationNode}
                className="hero__pagination-container"
                role="group"
                aria-label="Spotlight slides navigation"
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
