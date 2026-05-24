import type { GetEpisodesResult } from '@/shared/types/EpisodesListTypes';

export interface AnimexCatalogBffBody {
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

export interface AnimexCatalogBffOk {
  success: true;
  animexId: string;
  episodes: GetEpisodesResult['episodes'];
  totalEpisodes: number;
  hasSeriesDub?: boolean;
}

export interface AnimexCatalogBffErr {
  success: false;
  error: string;
}

export type AnimexCatalogBffResult = AnimexCatalogBffOk | AnimexCatalogBffErr;

export type StreamCatalogBffBody = AnimexCatalogBffBody;

const inFlightCatalogByAnilistId = new Map<string, Promise<AnimexCatalogBffResult>>();

function catalogDedupeKey(body: AnimexCatalogBffBody): string {
  return body.anilistId.trim();
}

async function fetchAnimexCatalog(
  body: AnimexCatalogBffBody,
  signal?: AbortSignal
): Promise<AnimexCatalogBffResult> {
  const res = await fetch('/api/animex/catalog', {
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
    return { success: false, error: 'animex_catalog_invalid_json' };
  }
  if (!json || typeof json !== 'object') {
    return { success: false, error: 'animex_catalog_empty' };
  }
  const o = json as { success?: boolean; error?: string };
  if (!res.ok || o.success !== true) {
    const err =
      typeof o.error === 'string' && o.error.trim()
        ? o.error.trim()
        : `animex_catalog_${res.status}`;
    return { success: false, error: err };
  }
  const ok = json as AnimexCatalogBffOk;
  if (typeof ok.animexId !== 'string' || !ok.animexId.trim()) {
    return { success: false, error: 'animex_catalog_bad_shape' };
  }
  return ok;
}

export async function postAnimexCatalog(
  body: AnimexCatalogBffBody,
  signal?: AbortSignal
): Promise<AnimexCatalogBffResult> {
  const key = catalogDedupeKey(body);
  if (!key) {
    return fetchAnimexCatalog(body, signal);
  }

  const existing = inFlightCatalogByAnilistId.get(key);
  if (existing) {
    return existing;
  }

  const promise = fetchAnimexCatalog(body, signal).finally(() => {
    if (inFlightCatalogByAnilistId.get(key) === promise) {
      inFlightCatalogByAnilistId.delete(key);
    }
  });

  inFlightCatalogByAnilistId.set(key, promise);
  return promise;
}
