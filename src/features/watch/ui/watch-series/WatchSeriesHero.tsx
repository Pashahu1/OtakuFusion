'use client';

import { type CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { HeroSlideTitle } from '@/components/Preview/HeroSlideTitle';
import { WatchSeriesInlineTags } from './WatchSeriesInlineTags';
import { WatchSeriesRatingRow } from './WatchSeriesRatingRow';
import { WatchSeriesDetails } from './WatchSeriesDetails';
import { useHeroImageAccent } from '@/features/watch/hooks/useHeroImageAccent';
import { useWatchHeroBackgroundImage } from '@/features/watch/hooks/useWatchHeroBackgroundImage';
import type { SpotlightAnime } from '@/shared/types/GlobalAnimeTypes';
import type { WatchCtaVariant } from '@/features/watch/lib/resolve-continue-watching-cta';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import { WATCH_HERO_BG_QUALITY } from '@/lib/anime-card-poster';
import { WatchSeriesSaveButton } from './WatchSeriesSaveButton';
import './WatchSeriesHero.scss';
import './WatchSeriesSaveButton.scss';

function animeDataToFavorite(anime: AnimeData) {
  return {
    id: anime.id,
    data_id: anime.data_id,
    poster: anime.poster,
    title: anime.title,
    japanese_title: anime.japanese_title,
    description: anime.animeInfo?.Overview,
    tvInfo: anime.animeInfo?.tvInfo,
    adultContent: anime.adultContent,
  };
}

interface WatchSeriesHeroProps {
  hero: SpotlightAnime;
  animeInfo: AnimeData;
  playHref: string;
  ctaLabel: string;
  ctaVariant?: WatchCtaVariant;
  isDetailsExpanded: boolean;
  onToggleDetails: () => void;
  heroArtworkPending?: boolean;
}

export function WatchSeriesHero({
  hero,
  animeInfo,
  playHref,
  ctaLabel,
  ctaVariant = 'watch',
  isDetailsExpanded,
  onToggleDetails,
  heroArtworkPending = false,
}: WatchSeriesHeroProps) {
  const {
    backgroundSrc,
    isBackgroundReady,
    showBackgroundSkeleton,
    onBackgroundLoad,
  } = useWatchHeroBackgroundImage(hero, heroArtworkPending);

  const accent = useHeroImageAccent(backgroundSrc ?? undefined);

  const heroStyle = {
    '--watch-hero-accent-border': accent.borderColor,
    '--watch-hero-accent-tint': accent.panelTint,
    '--watch-hero-accent': accent.accentColor,
  } as CSSProperties;

  return (
    <section
      className="watch-series-hero"
      aria-label="Series overview"
      style={heroStyle}
    >
      <div className="watch-series-hero__media">
        {showBackgroundSkeleton ? (
          <div className="watch-series-hero__media-skeleton" aria-hidden />
        ) : null}
        {backgroundSrc ? (
          <Image
            src={backgroundSrc}
            alt=""
            fill
            priority
            fetchPriority="high"
            loading="eager"
            decoding="async"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 100vw, 1280px"
            quality={WATCH_HERO_BG_QUALITY}
            onLoad={onBackgroundLoad}
            className={
              isBackgroundReady
                ? 'watch-series-hero__bg watch-series-hero__bg--visible'
                : 'watch-series-hero__bg watch-series-hero__bg--preloading'
            }
          />
        ) : null}
        <div className="watch-series-hero__shade watch-series-hero__shade--top" />
        <div className="watch-series-hero__shade watch-series-hero__shade--bottom" />
        <div className="watch-series-hero__shade watch-series-hero__shade--left" />
      </div>

      <div className="watch-series-hero__content">
        <div className="watch-series-hero__stack">
          <div className="watch-series-hero__spacer" aria-hidden />
          <div className="watch-series-hero__branding">
            <HeroSlideTitle anime={hero} priority />
            <WatchSeriesInlineTags animeInfo={animeInfo} />
            <WatchSeriesRatingRow scorePercent={hero.scorePercent} />
            <div className="watch-series-hero__actions">
              <Link
                href={playHref}
                className={
                  ctaVariant === 'continue'
                    ? 'watch-series-hero__cta watch-series-hero__cta--continue'
                    : 'watch-series-hero__cta watch-series-hero__cta--watch'
                }
              >
                <Play className="h-5 w-5 shrink-0 fill-current" aria-hidden />
                {ctaLabel}
              </Link>
              <WatchSeriesSaveButton anime={animeDataToFavorite(animeInfo)} />
            </div>
          </div>

          <div className="watch-series-hero__info-panel">
            <WatchSeriesDetails
              embedded
              animeInfo={animeInfo}
              isExpanded={isDetailsExpanded}
              onToggleExpanded={onToggleDetails}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
