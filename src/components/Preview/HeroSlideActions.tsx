'use client';

import Link from 'next/link';
import { Play } from 'lucide-react';
import { useWatchCta } from '@/features/watch/hooks/useWatchCta';

interface HeroSlideActionsProps {
  animeId: string;
  dataId?: number;
}

export function HeroSlideActions({ animeId, dataId }: HeroSlideActionsProps) {
  const { playHref, ctaLabel } = useWatchCta({
    animeId,
    dataId,
    episodes: null,
  });

  const ctaClass = 'hero__cta';

  return (
    <div className="hero__actions">
      <Link className={ctaClass} href={playHref}>
        <Play className="h-5 w-5 shrink-0 fill-current" aria-hidden />
        {ctaLabel}
      </Link>
    </div>
  );
}
