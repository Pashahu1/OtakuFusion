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
            width={800}
            height={310}
            sizes="(max-width: 480px) calc(100vw - 32px), (max-width: 1023px) min(480px, 85vw), 520px"
            className="hero__title-logo"
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
