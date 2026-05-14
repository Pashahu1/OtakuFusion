import type { GetEpisodesResult } from '@/shared/types/EpisodesListTypes';

export interface AnimepaheCatalogBffBody {
  anilistId: string;
  title: string;
  romaji_title?: string;
  japanese_title?: string;
  showType?: string;
  premiered?: string;
  episodeTotal?: string;
  mal_id?: number | null;
  synonyms?: string;
}

export interface AnimepaheCatalogBffOk {
  success: true;
  paheId: string;
  episodes: GetEpisodesResult['episodes'];
  totalEpisodes: number;
  /** З `POST /catalog` після dub-probe; для кешу в localStorage. */
  hasSeriesDub?: boolean;
}

export interface AnimepaheCatalogBffErr {
  success: false;
  error: string;
}

export async function postAnimepaheCatalog(
  body: AnimepaheCatalogBffBody,
  signal?: AbortSignal
): Promise<AnimepaheCatalogBffOk | AnimepaheCatalogBffErr> {
  const res = await fetch('/api/animepahe/catalog', {
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
    return { success: false, error: 'animepahe_catalog_invalid_json' };
  }
  if (!json || typeof json !== 'object') {
    return { success: false, error: 'animepahe_catalog_empty' };
  }
  const o = json as { success?: boolean; error?: string };
  if (!res.ok || o.success !== true) {
    const err =
      typeof o.error === 'string' && o.error.trim()
        ? o.error.trim()
        : `animepahe_catalog_${res.status}`;
    return { success: false, error: err };
  }
  const ok = json as AnimepaheCatalogBffOk;
  if (typeof ok.paheId !== 'string' || !ok.paheId.trim()) {
    return { success: false, error: 'animepahe_catalog_bad_shape' };
  }
  return ok;
}
