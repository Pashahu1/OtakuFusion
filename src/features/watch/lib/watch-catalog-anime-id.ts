import type { AnimeData } from '@/shared/types/animeDetailsTypes';

/** Route /watch/[id] param — single key for CW, previews, resume. */
export function resolveLocalWatchAnimeId(
  routeAnimeId: string | null | undefined,
  animeInfo?: AnimeData | null,
): string {
  const route = routeAnimeId?.trim();
  if (route) return route;
  return animeInfo?.id?.trim() ?? '';
}
