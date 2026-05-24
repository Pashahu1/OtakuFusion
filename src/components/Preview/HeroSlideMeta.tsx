import { Calendar, Clock, Film, Star, Tv } from 'lucide-react';
import type { HeroMetaItem } from './hero-slide-meta';

const META_ICONS: Record<string, typeof Star> = {
  score: Star,
  year: Calendar,
  episodes: Film,
  duration: Clock,
  format: Tv,
};

interface HeroSlideMetaProps {
  items: HeroMetaItem[];
}

export function HeroSlideMeta({ items }: HeroSlideMetaProps) {
  if (!items.length) return null;

  return (
    <ul className="hero__meta-badges" aria-label="Anime details">
      {items.map((item) => {
        const Icon = META_ICONS[item.key] ?? Film;
        const isScore = item.key === 'score';
        return (
          <li
            key={item.key}
            className={
              isScore ? 'hero__meta-badge hero__meta-badge--score' : 'hero__meta-badge'
            }
          >
            <Icon className="hero__meta-badge-icon" aria-hidden />
            <span>{item.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
