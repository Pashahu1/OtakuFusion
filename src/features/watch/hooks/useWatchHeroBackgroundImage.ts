'use client';

import { useMemo, useState } from 'react';

import type { SpotlightAnime } from '@/shared/types/GlobalAnimeTypes';
import { spotlightHeroBackgroundUrl } from '@/shared/utils/thumbnail-url';

interface UseWatchHeroBackgroundImageResult {
  backgroundSrc: string | null;
  isBackgroundReady: boolean;
  showBackgroundSkeleton: boolean;
  onBackgroundLoad: () => void;
}

export function useWatchHeroBackgroundImage(
  hero: SpotlightAnime,
  heroArtworkPending: boolean,
): UseWatchHeroBackgroundImageResult {
  const backgroundSrc = useMemo(() => {
    if (heroArtworkPending) return null;
    const src = spotlightHeroBackgroundUrl(hero);
    return src.trim() || null;
  }, [hero, heroArtworkPending]);

  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);

  const isBackgroundReady =
    backgroundSrc != null && loadedSrc === backgroundSrc;

  const onBackgroundLoad = () => {
    if (backgroundSrc) setLoadedSrc(backgroundSrc);
  };

  const showBackgroundSkeleton =
    heroArtworkPending || !backgroundSrc || !isBackgroundReady;

  return {
    backgroundSrc,
    isBackgroundReady,
    showBackgroundSkeleton,
    onBackgroundLoad,
  };
}
