import type { GetEpisodesResult } from '@/shared/types/EpisodesListTypes';

export interface AnicoreCatalogBffBody {
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

export interface AnicoreCatalogBffOk {
  success: true;
  anicoreId: string;
  episodes: GetEpisodesResult['episodes'];
  totalEpisodes: number;
  hasSeriesDub?: boolean;
}

export interface AnicoreCatalogBffErr {
  success: false;
  error: string;
}

export type AnicoreCatalogBffResult = AnicoreCatalogBffOk | AnicoreCatalogBffErr;

const inFlightCatalogByAnilistId = new Map<string, Promise<AnicoreCatalogBffResult>>();

function catalogDedupeKey(body: AnicoreCatalogBffBody): string {
  return body.anilistId.trim();
}

async function fetchAnicoreCatalog(
  body: AnicoreCatalogBffBody,
  signal?: AbortSignal
): Promise<AnicoreCatalogBffResult> {
  const res = await fetch('/api/anicore/catalog', {
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
    return { success: false, error: 'anicore_catalog_invalid_json' };
  }
  if (!json || typeof json !== 'object') {
    return { success: false, error: 'anicore_catalog_empty' };
  }
  const o = json as { success?: boolean; error?: string };
  if (!res.ok || o.success !== true) {
    const err =
      typeof o.error === 'string' && o.error.trim()
        ? o.error.trim()
        : `anicore_catalog_${res.status}`;
    return { success: false, error: err };
  }
  const ok = json as AnicoreCatalogBffOk;
  if (typeof ok.anicoreId !== 'string' || !ok.anicoreId.trim()) {
    return { success: false, error: 'anicore_catalog_bad_shape' };
  }
  return ok;
}

export async function postAnicoreCatalog(
  body: AnicoreCatalogBffBody,
  signal?: AbortSignal
): Promise<AnicoreCatalogBffResult> {
  const key = catalogDedupeKey(body);
  if (!key) {
    return fetchAnicoreCatalog(body, signal);
  }

  const existing = inFlightCatalogByAnilistId.get(key);
  if (existing) {
    return existing;
  }

  const promise = fetchAnicoreCatalog(body, signal).finally(() => {
    if (inFlightCatalogByAnilistId.get(key) === promise) {
      inFlightCatalogByAnilistId.delete(key);
    }
  });

  inFlightCatalogByAnilistId.set(key, promise);
  return promise;
}
