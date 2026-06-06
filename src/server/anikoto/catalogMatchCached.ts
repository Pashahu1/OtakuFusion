import { unstable_cache } from 'next/cache';
import { resolveAnikotoSlug } from '@/lib/catalog/providers/anikoto/resolveAnikotoSlug';
import { anikotoInfo } from '@/server/anikoto/client';
import { catalogHintsFromBody } from '@/server/catalog/catalogRequestSchema';
import {
  catalogMatchCacheKey,
  type CatalogLookupBody,
} from '@/server/catalog/catalogLookupTypes';

export interface AnikotoCatalogResolved {
  anikotoSlug: string;
  totalSub?: number;
  totalDub?: number;
}

async function resolveAnikotoCatalogUncached(
  input: CatalogLookupBody,
  knownSlug?: string | null,
): Promise<AnikotoCatalogResolved | null> {
  const hints = catalogHintsFromBody(input);
  const slug = await resolveAnikotoSlug({
    title: input.title,
    romaji_title: input.romaji_title,
    japanese_title: input.japanese_title,
    synonyms: input.synonyms,
    hints,
    knownSlug,
  });
  if (!slug) return null;

  try {
    const info = await anikotoInfo(slug);
    if (!info.success || !info.data?.id?.trim()) return null;
    return {
      anikotoSlug: info.data.id.trim(),
      totalSub: typeof info.data.totalSub === 'number' ? info.data.totalSub : undefined,
      totalDub: typeof info.data.totalDub === 'number' ? info.data.totalDub : undefined,
    };
  } catch {
    return { anikotoSlug: slug };
  }
}

export async function resolveAnikotoCatalogCached(
  input: CatalogLookupBody,
  knownSlug?: string | null,
): Promise<AnikotoCatalogResolved | null> {
  const key = catalogMatchCacheKey(input);
  const cached = unstable_cache(
    async () => resolveAnikotoCatalogUncached(input, knownSlug),
    ['anikoto-catalog-v1', key, knownSlug?.trim() ?? ''],
    { revalidate: 600, tags: ['anikoto-catalog', key] },
  );
  return cached();
}
