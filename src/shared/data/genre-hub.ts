import type { LucideIcon } from 'lucide-react';
import {
  Bot,
  Coffee,
  Compass,
  Ghost,
  Heart,
  Music,
  Rocket,
  Search,
  Skull,
  Smile,
  Sparkles,
  Swords,
  Theater,
  Trophy,
  Wand2,
} from 'lucide-react';
import { genres } from '@/shared/data/genres';

export interface GenreHubSectionConfig {
  id: string;
  label: string;
  sort: string[];
  /** Default AniList format for this row (browse can override via media filter). */
  format?: string;
}

export const GENRE_HUB_SECTIONS: GenreHubSectionConfig[] = [
  { id: 'popular', label: 'Popular', sort: ['POPULARITY_DESC'] },
  { id: 'new', label: 'New', sort: ['START_DATE_DESC'] },
  { id: 'top-rated', label: 'Top rated', sort: ['SCORE_DESC'] },
  {
    id: 'movies',
    label: 'Movies',
    sort: ['POPULARITY_DESC'],
    format: 'MOVIE',
  },
];

const GENRE_META: Record<
  string,
  { description: string; Icon: LucideIcon }
> = {
  Action: {
    description: 'High-energy battles, stakes, and momentum — for when you need speed and impact.',
    Icon: Swords,
  },
  Adventure: {
    description: 'Journeys, discovery, and worlds worth exploring — one episode closer to the horizon.',
    Icon: Compass,
  },
  Comedy: {
    description: 'Laughs, chaos, and feel-good energy — the antidote to a heavy watch list.',
    Icon: Smile,
  },
  Drama: {
    description: 'Character-driven stories with emotional weight — when you want to feel everything.',
    Icon: Theater,
  },
  Fantasy: {
    description: 'Magic, myth, and impossible worlds — escape the ordinary in full color.',
    Icon: Sparkles,
  },
  Horror: {
    description: 'Tension, dread, and things in the dark — not for the faint of heart.',
    Icon: Skull,
  },
  'Mahou Shoujo': {
    description: 'Magical girls, transformation, and hope — sparkle meets responsibility.',
    Icon: Wand2,
  },
  Mecha: {
    description: 'Giant robots, pilots, and tactical spectacle — metal at cinematic scale.',
    Icon: Bot,
  },
  Music: {
    description: 'Rhythm, performance, and sound as story — when the soundtrack drives the scene.',
    Icon: Music,
  },
  Mystery: {
    description: 'Clues, twists, and answers just out of reach — stay curious until the reveal.',
    Icon: Search,
  },
  Romance: {
    description: 'Connections, tension, and heartfelt beats — stories that pull you closer.',
    Icon: Heart,
  },
  'Sci-Fi': {
    description: 'Future tech, space, and big ideas — speculate boldly with every episode.',
    Icon: Rocket,
  },
  'Slice of Life': {
    description: 'Everyday moments, warmth, and quiet charm — life at a gentler pace.',
    Icon: Coffee,
  },
  Sports: {
    description: 'Competition, teamwork, and the drive to win — feel the rush of the match.',
    Icon: Trophy,
  },
  Supernatural: {
    description: 'Spirits, powers beyond reason, and the unknown — reality with extra rules.',
    Icon: Ghost,
  },
};

export function getGenreMeta(genre: string) {
  const known = GENRE_META[genre];
  if (known) return known;
  return {
    description: `Explore the best of ${genre} anime — curated from trending and popular picks.`,
    Icon: Sparkles,
  };
}

export function isKnownGenre(genre: string): boolean {
  return genres.includes(genre);
}

export type GenreBrowseSectionId =
  (typeof GENRE_HUB_SECTIONS)[number]['id'];

export type GenreMediaFilter = 'all' | 'tv' | 'movie';

export function getGenreSectionConfig(
  sectionId: string
): GenreHubSectionConfig | undefined {
  return GENRE_HUB_SECTIONS.find((s) => s.id === sectionId);
}

export function resolveBrowseAnilistFormat(
  section: GenreHubSectionConfig,
  media: GenreMediaFilter
): string | undefined {
  if (media === 'tv') return 'TV';
  if (media === 'movie') return 'MOVIE';
  return section.format;
}
