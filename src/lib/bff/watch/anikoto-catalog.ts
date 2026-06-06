import type { WatchCatalogBffBody } from '@/lib/bff/watch/catalog-body';

export interface AnikotoCatalogBffOk {
  success: true;
  anikotoSlug: string;
  totalSub?: number;
  totalDub?: number;
}

export interface AnikotoCatalogBffErr {
  success: false;
  error: string;
}

export async function postAnikotoCatalog(
  body: WatchCatalogBffBody & { anikotoSlug?: string },
  signal?: AbortSignal,
): Promise<AnikotoCatalogBffOk | AnikotoCatalogBffErr> {
  const res = await fetch('/api/anikoto/catalog', {
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
    return { success: false, error: 'anikoto_catalog_invalid_json' };
  }
  if (!json || typeof json !== 'object') {
    return { success: false, error: 'anikoto_catalog_empty' };
  }
  const o = json as { success?: boolean; error?: string };
  if (!res.ok || o.success !== true) {
    const err =
      typeof o.error === 'string' && o.error.trim()
        ? o.error.trim()
        : `anikoto_catalog_${res.status}`;
    return { success: false, error: err };
  }
  const ok = json as AnikotoCatalogBffOk;
  if (typeof ok.anikotoSlug !== 'string' || !ok.anikotoSlug.trim()) {
    return { success: false, error: 'anikoto_catalog_bad_shape' };
  }
  return ok;
}
