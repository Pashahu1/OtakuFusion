'use client';

import { useEffect, useMemo, useState } from 'react';

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

  const [isBackgroundReady, setIsBackgroundReady] = useState(false);

  useEffect(() => {
    setIsBackgroundReady(false);
  }, [backgroundSrc]);

  const onBackgroundLoad = () => {
    setIsBackgroundReady(true);
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
