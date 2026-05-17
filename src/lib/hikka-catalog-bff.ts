import type { GetEpisodesResult } from '@/shared/types/EpisodesListTypes';
import type { AnimepaheCatalogBffBody } from '@/lib/animepahe-catalog-bff';
import type { HikkaWatchSource } from '@/services/hikka/hikkaTypes';

export interface HikkaCatalogBffOk {
  success: true;
  hikkaSlug: string;
  source: HikkaWatchSource;
  team: string;
  episodes: GetEpisodesResult['episodes'];
  totalEpisodes: number;
  availableTeams?: Array<{ source: HikkaWatchSource; team: string; episodeCount: number }>;
}

export interface HikkaCatalogBffErr {
  success: false;
  error: string;
}

export async function postHikkaCatalog(
  body: AnimepaheCatalogBffBody,
  signal?: AbortSignal
): Promise<HikkaCatalogBffOk | HikkaCatalogBffErr> {
  const res = await fetch('/api/hikka/catalog', {
    method: 'POST',
    cache: 'no-store',
    signal,
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json: unknown = null;
  try {
    json = text.trim() ? JSON.parse(text) : null;
  } catch {
    return { success: false, error: 'hikka_catalog_invalid_json' };
  }
  if (!json || typeof json !== 'object') {
    return { success: false, error: 'hikka_catalog_empty' };
  }
  const o = json as { success?: boolean; error?: string };
  if (!res.ok || o.success !== true) {
    const err =
      typeof o.error === 'string' && o.error.trim()
        ? o.error.trim()
        : `hikka_catalog_${res.status}`;
    return { success: false, error: err };
  }
  const ok = json as HikkaCatalogBffOk;
  if (typeof ok.hikkaSlug !== 'string' || !ok.hikkaSlug.trim()) {
    return { success: false, error: 'hikka_catalog_bad_shape' };
  }
  return ok;
}
