import { unstable_cache } from 'next/cache';
import { fetchHikkaWatchV2 } from '@/lib/catalog/providers/hikka/hikkaFeaturesClient';
import {
  mapHikkaTeamEpisodes,
  type HikkaCatalogPick,
} from '@/lib/catalog/providers/hikka/mapHikkaCatalog';
import { resolveHikkaSlug } from '@/lib/catalog/providers/hikka/resolveHikkaSlug';
import { resolveHikkaTeamForTitles } from '@/lib/catalog/providers/hikka/verifyHikkaTeam';
import { buildCatalogSearchTermsFromFields } from '@/lib/catalog/catalog-hints';
import { catalogHintsFromBody } from '@/server/catalog/catalogRequestSchema';
import type { CatalogLookupBody } from '@/server/catalog/catalogLookupTypes';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';

export interface HikkaCatalogResolved {
  hikkaSlug: string;
  pick: HikkaCatalogPick;
  episodes: EpisodesTypes[];
  totalEpisodes: number;
  ukrainianPlayable: boolean;
}

function placeholderEpisodes(count: number, title: string): EpisodesTypes[] {
  const total = Math.min(Math.max(Math.floor(count), 0), 500);
  const episodes: EpisodesTypes[] = [];
  for (let episodeNo = 1; episodeNo <= total; episodeNo += 1) {
    episodes.push({
      episode_no: episodeNo,
      id: String(episodeNo),
      data_id: episodeNo,
      jname: title,
      title: `Episode ${episodeNo}`,
      japanese_title: `Episode ${episodeNo}`,
      hasSub: false,
      hasDub: false,
    });
  }
  return episodes;
}

async function resolveHikkaCatalogUncached(
  input: CatalogLookupBody
): Promise<HikkaCatalogResolved | null> {
  const hints = catalogHintsFromBody(input);
  const terms = buildCatalogSearchTermsFromFields({
    title: input.title,
    romaji_title: input.romaji_title,
    japanese_title: input.japanese_title,
    synonyms: input.synonyms,
  });
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

  const team = await resolveHikkaTeamForTitles(watch, terms);
  if (!team) return null;

  const displayTitle = input.title.trim() || input.romaji_title?.trim() || 'Anime';
  const linkedEpisodes = mapHikkaTeamEpisodes(watch, team.pick, displayTitle);
  const seasonEpisodes = placeholderEpisodes(hints.episodeCount ?? 0, displayTitle);
  const episodes =
    team.ukrainianPlayable || !seasonEpisodes.length ? linkedEpisodes : seasonEpisodes;
  if (!episodes.length) return null;

  return {
    hikkaSlug: slug,
    pick: team.pick,
    episodes,
    totalEpisodes: episodes.length,
    ukrainianPlayable: team.ukrainianPlayable,
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
  return `hikka-catalog-v5:${input.anilistId.trim()}:${mal}:${terms[0] ?? input.title}`;
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
