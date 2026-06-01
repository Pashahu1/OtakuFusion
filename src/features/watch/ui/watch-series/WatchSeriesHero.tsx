'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { HeroSlideTitle } from '@/components/Preview/HeroSlideTitle';
import { WatchSeriesInlineTags } from './WatchSeriesInlineTags';
import { WatchSeriesRatingRow } from './WatchSeriesRatingRow';
import { WatchSeriesDetails } from './WatchSeriesDetails';
import { useHeroImageAccent } from '@/features/watch/hooks/useHeroImageAccent';
import type { SpotlightAnime } from '@/shared/types/GlobalAnimeTypes';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import type { WatchCtaVariant } from '@/features/watch/lib/resolve-continue-watching-cta';
import { spotlightHeroBackgroundUrl } from '@/shared/utils/thumbnail-url';
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

function heroUsesAniListPoster(hero: SpotlightAnime): boolean {
  return (
    !hero.heroImageUrl?.trim() &&
    (hero.poster.includes('anilist.co') || hero.poster.includes('s4.anilist.co'))
  );
}

interface WatchSeriesHeroProps {
  hero: SpotlightAnime;
  animeInfo: AnimeData;
  playHref: string;
  ctaLabel: string;
  ctaVariant?: WatchCtaVariant;
  isDetailsExpanded: boolean;
  onToggleDetails: () => void;
}

export function WatchSeriesHero({
  hero,
  animeInfo,
  playHref,
  ctaLabel,
  ctaVariant = 'watch',
  isDetailsExpanded,
  onToggleDetails,
}: WatchSeriesHeroProps) {
  const bgSrc = spotlightHeroBackgroundUrl(hero);
  const accent = useHeroImageAccent(bgSrc);

  const heroStyle = {
    '--watch-hero-accent-border': accent.borderColor,
    '--watch-hero-accent-tint': accent.panelTint,
    '--watch-hero-accent': accent.accentColor,
  } as React.CSSProperties;

  return (
    <section
      className="watch-series-hero"
      aria-label="Series overview"
      style={heroStyle}
    >
      <div className="watch-series-hero__media">
        <Image
          src={bgSrc}
          alt=""
          fill
          priority
          sizes="100vw"
          className="watch-series-hero__bg"
          unoptimized={heroUsesAniListPoster(hero)}
        />
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
                className={`watch-series-hero__cta watch-series-hero__cta--${ctaVariant}`}
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
