'use client';

import Link from 'next/link';
import { Play } from 'lucide-react';
import { useWatchCta } from '@/features/watch/hooks/useWatchCta';

interface HeroSlideActionsProps {
  animeId: string;
}

export function HeroSlideActions({ animeId }: HeroSlideActionsProps) {
  const { playHref, ctaLabel, variant } = useWatchCta({
    animeId,
    episodes: null,
  });

  return (
    <div className="hero__actions">
      <Link className={`hero__cta hero__cta--${variant}`} href={playHref}>
        <Play className="h-5 w-5 shrink-0 fill-current" aria-hidden />
        {ctaLabel}
      </Link>
    </div>
  );
}
