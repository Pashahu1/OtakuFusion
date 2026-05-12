import 'server-only';

import { unstable_cache } from 'next/cache';
import { animekaiApi } from '@/lib/animekai-api';
import {
  mapAnimeKaiEpisodesResponseToResult,
  type AnimeKaiEpisodesResponse,
} from '@/services/kai/episodeMapping';
import type { GetEpisodesResult } from '@/shared/types/EpisodesListTypes';

const EPISODES_CACHE_SECONDS = 30 * 60;

function isSafeAniIdSegment(value: string): boolean {
  const t = value.trim();
  if (t.length < 1 || t.length > 96) return false;
  /** Блокуємо керуючі символи, пробіли та лапки — решта допускається для ani_id з API. */
  if (/[\u0000-\u0020<>"]/.test(t)) return false;
  return true;
}

/**
 * Кешоване завантаження списку епізодів AnimeKai (лише сервер).
 * Клієнт ходить на GET /api/kai/episodes — той самий шар кешу.
 */
export async function getAnimeKaiEpisodesCached(aniId: string): Promise<GetEpisodesResult> {
  const key = aniId.trim();
  if (!key) {
    return { episodes: [], totalEpisodes: 0 };
  }
  if (!isSafeAniIdSegment(key)) {
    return { episodes: [], totalEpisodes: 0 };
  }

  const fetcher = unstable_cache(
    async (): Promise<GetEpisodesResult> => {
      const data = await animekaiApi.get<AnimeKaiEpisodesResponse>(
        `/api/episodes/${encodeURIComponent(key)}`
      );
      return mapAnimeKaiEpisodesResponseToResult(data);
    },
    ['kai-episodes-v1', key],
    { revalidate: EPISODES_CACHE_SECONDS }
  );

  return fetcher();
}
