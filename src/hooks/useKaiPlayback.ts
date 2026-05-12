import { useWatch } from './useWatch';
import type { UseWatchReturn } from '@/shared/types/UseWatchReturn';

/**
 * Контейнерний хук перегляду за схемою **AniList (метадані в URL) → AnimeKai (episodes / servers / source)**.
 *
 * Ролі:
 * - AniList: картка, постер, прогрес, `idMal`, опис UI.
 * - `useWatchAnime`: мапінг `anilistId` → `ani_id` (кеш localStorage → GET `/api/anime/anilist/{id}` → MAL → fuzzy search),
 *   список епізодів Kai.
 * - `useWatchStream`: GET `/api/watch/resolve` (той самий ланцюжок, що на сервері: episodes → servers → probe).
 *
 * Для стабільного прод-мапінгу краще таблиця на бекенді (`/internal/animekai/mapping/*`); клієнтський кеш — підстраховка.
 *
 * Це **alias** для `useWatch` — одна реалізація, дві назви за контекстом архітектури.
 */
export function useKaiPlayback(
  animeId: string,
  initialEpisodeId: string | undefined
): UseWatchReturn {
  return useWatch(animeId, initialEpisodeId);
}

export type { UseWatchReturn as KaiPlaybackReturn } from '@/shared/types/UseWatchReturn';
