'use client';

import Image from 'next/image';
import { useState } from 'react';

import type { SpotlightAnime } from '@/shared/types/GlobalAnimeTypes';
import {
  HERO_THUMBNAIL_RES,
  spotlightHeroBackgroundUrl,
  thumbnailUrl,
} from '@/shared/utils/thumbnail-url';

interface HeroSpotlightBackgroundImageProps {
  anime: SpotlightAnime;
  index: number;
}

export function HeroSpotlightBackgroundImage({
  anime,
  index,
}: HeroSpotlightBackgroundImageProps) {
  const fallbackSrc = thumbnailUrl(anime.poster, HERO_THUMBNAIL_RES);
  const primarySrc = spotlightHeroBackgroundUrl(anime) || fallbackSrc;
  const [src, setSrc] = useState(primarySrc);

  return (
    <Image
      src={src}
      alt={anime.title}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 100vw, 1600px"
      priority={index === 0}
      className="preview__bg-image object-cover object-center brightness-75 contrast-110"
      decoding="async"
      fetchPriority={index === 0 ? 'high' : 'auto'}
      loading={index === 0 ? 'eager' : 'lazy'}
      quality={index === 0 ? 82 : 72}
      onError={() => {
        if (fallbackSrc && src !== fallbackSrc) {
          setSrc(fallbackSrc);
        }
      }}
    />
  );
}
