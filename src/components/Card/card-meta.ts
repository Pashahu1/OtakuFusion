import type { AnimeInfo } from '@/shared/types/GlobalAnimeTypes';

export function splitTenPointRating(rating: string): { score: string; outOfTen?: string } {
  const trimmed = rating.trim();
  const m = trimmed.match(/^(\d+(?:\.\d+)?)\s*\/\s*10$/i);
  if (m) return { score: m[1], outOfTen: '/10' };
  return { score: trimmed };
}

/** Fallback line when stream availability labels are not in catalog yet. */
export function buildCardFooterFallbackLine(tv: AnimeInfo['tvInfo']): string | null {
  if (!tv) return null;
  const epRaw = typeof tv.episodeTotal === 'string' ? tv.episodeTotal.trim() : '';
  const hasEpisodeTotal = /^\d+(\.\d+)?$/.test(epRaw);
  const parts: string[] = [];
  const showT = tv.showType?.trim();
  if (showT) parts.push(showT);
  if (hasEpisodeTotal) {
    parts.push(`${Number(epRaw).toLocaleString()} Episodes`);
  }
  const dur = tv.duration?.trim();
  if (dur) parts.push(dur);
  return parts.length > 0 ? parts.join(' · ') : null;
}
