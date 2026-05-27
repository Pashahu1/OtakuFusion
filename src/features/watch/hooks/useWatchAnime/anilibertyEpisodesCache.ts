import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';

const CACHE_TTL_MS = 45 * 60 * 1000;

interface CachedLibertyEpisodesPayload {
  libertyId: string;
  episodes: EpisodesTypes[];
  totalEpisodes: number;
  savedAt: number;
}

function cacheKey(localAnimeId: string): string {
  return `aniliberty:episodes:${localAnimeId.trim()}`;
}

export function readLibertyEpisodesCache(
  localAnimeId: string,
  libertyId: string
): { episodes: EpisodesTypes[]; totalEpisodes: number } | null {
  if (typeof window === 'undefined') return null;
  const expectedId = libertyId.trim();
  if (!expectedId) return null;
  try {
    const raw = localStorage.getItem(cacheKey(localAnimeId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedLibertyEpisodesPayload;
    if (parsed.libertyId?.trim() !== expectedId) return null;
    if (!Array.isArray(parsed.episodes) || !parsed.episodes.length) return null;
    if (Date.now() - (parsed.savedAt ?? 0) > CACHE_TTL_MS) return null;
    const total =
      typeof parsed.totalEpisodes === 'number' && parsed.totalEpisodes > 0
        ? parsed.totalEpisodes
        : parsed.episodes.length;
    return { episodes: parsed.episodes, totalEpisodes: total };
  } catch {
    return null;
  }
}

export function writeLibertyEpisodesCache(
  localAnimeId: string,
  libertyId: string,
  episodes: EpisodesTypes[],
  totalEpisodes: number
): void {
  if (typeof window === 'undefined') return;
  const id = libertyId.trim();
  if (!id || !episodes.length) return;
  try {
    const payload: CachedLibertyEpisodesPayload = {
      libertyId: id,
      episodes,
      totalEpisodes: totalEpisodes > 0 ? totalEpisodes : episodes.length,
      savedAt: Date.now(),
    };
    localStorage.setItem(cacheKey(localAnimeId), JSON.stringify(payload));
  } catch {

  }
}

export function clearLibertyEpisodesCache(localAnimeId: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(cacheKey(localAnimeId));
  } catch {

  }
}
