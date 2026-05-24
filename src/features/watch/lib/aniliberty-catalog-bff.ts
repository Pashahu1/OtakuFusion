import type { GetEpisodesResult } from '@/shared/types/EpisodesListTypes';
import type { AnicoreCatalogBffBody } from '@/features/watch/lib/anicore-catalog-bff';

export interface AnilibertyCatalogBffOk {
  success: true;
  libertyId: string;
  episodes: GetEpisodesResult['episodes'];
  totalEpisodes: number;
}

export interface AnilibertyCatalogBffErr {
  success: false;
  error: string;
}

export async function postAnilibertyCatalog(
  body: AnicoreCatalogBffBody,
  signal?: AbortSignal
): Promise<AnilibertyCatalogBffOk | AnilibertyCatalogBffErr> {
  const res = await fetch('/api/aniliberty/catalog', {
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
    return { success: false, error: 'aniliberty_catalog_invalid_json' };
  }
  if (!json || typeof json !== 'object') {
    return { success: false, error: 'aniliberty_catalog_empty' };
  }
  const o = json as { success?: boolean; error?: string };
  if (!res.ok || o.success !== true) {
    const err =
      typeof o.error === 'string' && o.error.trim()
        ? o.error.trim()
        : `aniliberty_catalog_${res.status}`;
    return { success: false, error: err };
  }
  const ok = json as AnilibertyCatalogBffOk;
  if (typeof ok.libertyId !== 'string' || !ok.libertyId.trim()) {
    return { success: false, error: 'aniliberty_catalog_bad_shape' };
  }
  return ok;
}
