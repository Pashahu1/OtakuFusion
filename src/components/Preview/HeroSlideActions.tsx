import Link from 'next/link';
import { Play } from 'lucide-react';

interface HeroSlideActionsProps {
  animeId: string;
}

export function HeroSlideActions({ animeId }: HeroSlideActionsProps) {
  return (
    <div className="hero__actions">
      <Link
        className="hero__cta hero__cta--watch bg-brand-orange text-brand-gray-light hover:bg-brand-orange-light hover:text-brand-gray w-full max-w-[300px] rounded-md px-4 py-3 text-center text-base font-medium transition-colors md:py-2.5"
        href={`/watch/${animeId}?ep=1`}
      >
        <Play className="h-5 w-5 shrink-0 fill-current" aria-hidden />
        Watch Now
      </Link>
    </div>
  );
}
