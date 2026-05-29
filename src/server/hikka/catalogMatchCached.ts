import { unstable_cache } from 'next/cache';
import { fetchHikkaWatchV2 } from '@/services/hikka/hikkaFeaturesClient';
import {
  mapHikkaTeamEpisodes,
  pickDefaultHikkaCatalog,
  type HikkaCatalogPick,
} from '@/services/hikka/mapHikkaCatalog';
import { resolveHikkaSlug } from '@/services/hikka/resolveHikkaSlug';
import { buildCatalogSearchTermsFromFields } from '@/services/catalog/catalogHints';
import { catalogHintsFromBody } from '@/server/catalog/catalogRequestSchema';
import type { CatalogLookupBody } from '@/server/catalog/catalogLookupTypes';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';

export interface HikkaCatalogResolved {
  hikkaSlug: string;
  pick: HikkaCatalogPick;
  episodes: EpisodesTypes[];
  totalEpisodes: number;
}

async function resolveHikkaCatalogUncached(
  input: CatalogLookupBody
): Promise<HikkaCatalogResolved | null> {
  const hints = catalogHintsFromBody(input);
  const slug = await resolveHikkaSlug({
    malId: hints.malId,
    title: input.title,
    romaji_title: input.romaji_title,
    japanese_title: input.japanese_title,
    synonyms: input.synonyms,
    hints,
  });
  if (!slug) return null;

  const watch = await fetchHikkaWatchV2(slug);
  if (!watch) return null;

  const pick = pickDefaultHikkaCatalog(watch);
  if (!pick) return null;

  const displayTitle = input.title.trim() || input.romaji_title?.trim() || 'Anime';
  const episodes = mapHikkaTeamEpisodes(watch, pick, displayTitle);
  if (!episodes.length) return null;

  return {
    hikkaSlug: slug,
    pick,
    episodes,
    totalEpisodes: episodes.length,
  };
}

function catalogCacheKey(input: CatalogLookupBody): string {
  const terms = buildCatalogSearchTermsFromFields({
    title: input.title,
    romaji_title: input.romaji_title,
    japanese_title: input.japanese_title,
    synonyms: input.synonyms,
  });
  const mal = input.mal_id != null ? String(input.mal_id) : '';
  return `hikka-catalog-v1:${input.anilistId.trim()}:${mal}:${terms[0] ?? input.title}`;
}

export async function resolveHikkaCatalogCached(
  input: CatalogLookupBody
): Promise<HikkaCatalogResolved | null> {
  const key = catalogCacheKey(input);
  const cached = unstable_cache(
    async () => resolveHikkaCatalogUncached(input),
    [key],
    { revalidate: 600, tags: ['hikka-catalog', key] }
  );
  return cached();
}
