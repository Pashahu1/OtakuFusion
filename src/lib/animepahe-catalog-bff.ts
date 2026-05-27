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
  /** ╨ù `POST /catalog` ╨┐╤û╤ü╨╗╤Å dub-probe; ╨┤╨╗╤Å ╨║╨╡╤ê╤â ╨▓ localStorage. */
  hasSeriesDub?: boolean;
}

export interface AnimepaheCatalogBffErr {
  success: false;
  error: string;
}

export type AnimepaheCatalogBffResult = AnimepaheCatalogBffOk | AnimepaheCatalogBffErr;

const inFlightCatalogByAnilistId = new Map<string, Promise<AnimepaheCatalogBffResult>>();

function catalogDedupeKey(body: AnimepaheCatalogBffBody): string {
  return body.anilistId.trim();
}

async function fetchAnimepaheCatalog(
  body: AnimepaheCatalogBffBody,
  signal?: AbortSignal
): Promise<AnimepaheCatalogBffResult> {
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

/** ╨₧╨┤╨╕╨╜ in-flight POST /catalog ╨╜╨░ anilistId ΓÇö ╨╝╨╡╨╜╤ê╨╡ 429 ╨┐╤Ç╨╕ ╤ê╨▓╨╕╨┤╨║╨╕╤à ╨┐╨╡╤Ç╨╡╤à╨╛╨┤╨░╤à ╨┐╨╛ ╨║╨░╤Ç╤é╨║╨░╤à. */
export async function postAnimepaheCatalog(
  body: AnimepaheCatalogBffBody,
  signal?: AbortSignal
): Promise<AnimepaheCatalogBffResult> {
  const key = catalogDedupeKey(body);
  if (!key) {
    return fetchAnimepaheCatalog(body, signal);
  }

  const existing = inFlightCatalogByAnilistId.get(key);
  if (existing) {
    return existing;
  }

  const promise = fetchAnimepaheCatalog(body).finally(() => {
    if (inFlightCatalogByAnilistId.get(key) === promise) {
      inFlightCatalogByAnilistId.delete(key);
    }
  });

  inFlightCatalogByAnilistId.set(key, promise);
  return promise;
}
