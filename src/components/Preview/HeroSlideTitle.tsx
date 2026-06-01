'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { SpotlightAnime } from '@/shared/types/GlobalAnimeTypes';

interface HeroSlideTitleProps {
  anime: SpotlightAnime;
  priority?: boolean;
}

function HeroSeasonLabel({ label }: { label: string }) {
  return <p className="hero__season-label">{label}</p>;
}

export function HeroSlideTitle({ anime, priority = false }: HeroSlideTitleProps) {
  const [logoFailed, setLogoFailed] = useState(false);
  const logoUrl = anime.clearLogoUrl?.trim();
  const showLogo = Boolean(logoUrl) && !logoFailed;
  const seasonLabel = anime.seasonLabel?.trim();

  if (showLogo && logoUrl) {
    return (
      <div className="hero__title-block">
        <div className="hero__title-logo-wrap">
          <Image
            src={logoUrl}
            alt={anime.title}
            width={520}
            height={202}
            sizes="(max-width: 767px) min(92vw, 340px), (max-width: 1023px) min(460px, 92vw), 520px"
            className="hero__title-logo h-auto w-auto max-w-full"
            priority={priority}
            unoptimized
            onError={() => setLogoFailed(true)}
          />
        </div>
        {seasonLabel ? <HeroSeasonLabel label={seasonLabel} /> : null}
      </div>
    );
  }

  return (
    <div className="hero__title-block">
      <h1 className="hero__title">{anime.title}</h1>
      {seasonLabel ? <HeroSeasonLabel label={seasonLabel} /> : null}
    </div>
  );
}
