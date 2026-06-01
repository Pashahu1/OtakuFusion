import type { TvInfo } from '@/shared/types/GlobalAnimeTypes';

import type { AniListDate, AniListMedia, AniListTitle } from './types';

export function pickTitle(title?: AniListTitle | null): string {
  return title?.english || title?.romaji || title?.native || 'Unknown title';
}

/**
 * Extract episode number from `streamingEpisodes` string (various Crunchyroll / other formats).
 * Returns [number as string, full raw string for map].
 */
function parseStreamingEpisodeNumber(raw: string): [string, string] | null {
  const t = raw.trim();
  if (!t) return null;
  const patterns: RegExp[] = [
    /^\s*(?:Episode|Ep\.?)\s*#?\s*(\d+)\b/i,
    /^\s*(\d+)\s*[.:\-|–—]\s+\S/,
    /^\s*#?\s*(\d+)\s+[–—\-]\s+\S/,
  ];
  for (const re of patterns) {
    const m = t.match(re);
    if (m?.[1] && /^\d+$/.test(m[1])) return [m[1], t];
  }
  return null;
}

/** Build map episode number → string from `streamingEpisodes` (first match per number). */
export function buildAnilistEpisodeTitleRecord(
  streaming?: ReadonlyArray<{ title?: string | null } | null> | null,
): Record<string, string> | undefined {
  if (!Array.isArray(streaming) || !streaming.length) return undefined;
  const out: Record<string, string> = {};
  for (const row of streaming) {
    const raw = row?.title?.trim();
    if (!raw) continue;
    const parsed = parseStreamingEpisodeNumber(raw);
    if (!parsed) continue;
    const [numKey] = parsed;
    if (out[numKey]) continue;
    out[numKey] = raw;
  }
  return Object.keys(out).length ? out : undefined;
}

function toReleaseDate(startDate?: AniListDate | null): string {
  if (!startDate?.year) return '';
  const month = startDate.month ? String(startDate.month).padStart(2, '0') : '01';
  const day = startDate.day ? String(startDate.day).padStart(2, '0') : '01';
  return `${startDate.year}-${month}-${day}`;
}

export function toTvInfo(media: AniListMedia): TvInfo {
  const hasEpisodes = typeof media.episodes === 'number' && media.episodes > 0;
  const releaseDate =
    typeof media.seasonYear === 'number'
      ? String(media.seasonYear)
      : toReleaseDate(media.startDate);

  return {
    showType: media.format ?? 'TV',
    duration:
      typeof media.duration === 'number' && media.duration > 0
        ? `${media.duration}m`
        : '',
    releaseDate,
    quality: 'HD',
    episodeTotal: hasEpisodes ? String(media.episodes) : undefined,
    rating:
      typeof media.averageScore === 'number' && media.averageScore > 0
        ? `${media.averageScore / 10}/10`
        : undefined,
  };
}

export function stripHtml(raw?: string | null): string {
  if (!raw) return '';
  return raw.replace(/<[^>]*>/g, '').trim();
}

export function mapStatus(status?: string | null): string {
  if (!status) return '';
  return status
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function formatDate(startDate?: AniListDate | null): string {
  const year = startDate?.year;
  if (!year) return '';
  const month = startDate.month ? String(startDate.month).padStart(2, '0') : '01';
  const day = startDate.day ? String(startDate.day).padStart(2, '0') : '01';
  return `${year}-${month}-${day}`;
}
