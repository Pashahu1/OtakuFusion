import type { SpotlightAnime } from '@/shared/types/GlobalAnimeTypes';

export interface HeroMetaItem {
  key: string;
  label: string;
}

function formatDuration(raw: string | undefined): string | null {
  const t = raw?.trim();
  if (!t) return null;
  if (/min/i.test(t)) return t;
  const m = t.match(/^(\d+)\s*m$/i);
  if (m) return `${m[1]} min`;
  return t;
}

export function buildHeroMetaItems(anime: SpotlightAnime): HeroMetaItem[] {
  const tv = anime.tvInfo;
  const items: HeroMetaItem[] = [];

  if (typeof anime.scorePercent === 'number' && anime.scorePercent > 0) {
    const pct = Math.round(anime.scorePercent);
    items.push({ key: 'score', label: `${pct}%` });
  }

  const year = tv?.releaseDate?.trim();
  if (year && /^\d{4}$/.test(year)) {
    items.push({ key: 'year', label: year });
  }

  const epTotal = tv?.episodeTotal?.trim();
  if (epTotal && /^\d+$/.test(epTotal)) {
    items.push({ key: 'episodes', label: `${epTotal} Episodes` });
  }

  const duration = formatDuration(tv?.duration);
  if (duration) {
    items.push({ key: 'duration', label: duration });
  }

  const showType = tv?.showType?.trim();
  if (showType) {
    items.push({ key: 'format', label: showType.replace(/_/g, ' ') });
  }

  return items;
}
