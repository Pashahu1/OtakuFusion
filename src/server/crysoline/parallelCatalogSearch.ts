import { normalizeCatalogSearchQuery } from '@/services/catalog/catalogHints';

export interface ParallelCatalogSearchOptions {
  maxQueries?: number;
  mergedSoftCap?: number;
}

/**
 * Паралельні запити search до Crysoline (замість послідовного for).
 * Помилки окремого запиту ігноруються — інші результати все одно зливаються.
 */
export async function mergeParallelCatalogSearch<T>(
  queue: string[],
  searchOne: (normalizedQuery: string) => Promise<T[]>,
  getMergeKey: (hit: T) => string | number | null | undefined,
  options?: ParallelCatalogSearchOptions
): Promise<T[]> {
  const maxQueries = options?.maxQueries ?? 3;
  const softCap = options?.mergedSoftCap ?? 10;

  const queries = queue
    .slice(0, maxQueries)
    .map((q) => normalizeCatalogSearchQuery(q))
    .filter((q) => q.length >= 2);

  if (!queries.length) return [];

  const batches = await Promise.all(
    queries.map((q) =>
      searchOne(q).catch(() => [] as T[])
    )
  );

  const merged = new Map<string, T>();
  for (const hits of batches) {
    for (const h of hits) {
      const rawKey = getMergeKey(h);
      if (rawKey == null) continue;
      const key = typeof rawKey === 'number' ? String(rawKey) : String(rawKey).trim();
      if (!key) continue;
      if (!merged.has(key)) merged.set(key, h);
      if (merged.size >= softCap) break;
    }
    if (merged.size >= softCap) break;
  }

  return [...merged.values()];
}
