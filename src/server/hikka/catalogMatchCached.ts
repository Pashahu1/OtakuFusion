import { unstable_cache } from 'next/cache';
import { fetchHikkaWatchV2 } from '@/services/hikka/hikkaFeaturesClient';
import {
  mapHikkaTeamEpisodes,
  pickDefaultHikkaCatalog,
  type HikkaCatalogPick,
} from '@/services/hikka/mapHikkaCatalog';
import { resolveHikkaSlug } from '@/services/hikka/resolveHikkaSlug';
import {
  buildAnimepaheSearchTermsFromFields,
  type AnimepaheCatalogHints,
} from '@/services/animepahe/catalogHints';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';

export interface HikkaCatalogMatchInput {
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

function hintsFromInput(input: HikkaCatalogMatchInput): AnimepaheCatalogHints {
  const prem = input.premiered?.trim();
  let seasonYear: number | null = null;
  if (prem && /^\d{4}$/.test(prem)) seasonYear = parseInt(prem, 10);
  const et = input.episodeTotal?.trim();
  let episodeCount: number | null = null;
  if (et && /^\d+$/.test(et)) episodeCount = parseInt(et, 10);
  let anilistId: number | null = null;
  if (/^\d+$/.test(input.anilistId.trim())) anilistId = parseInt(input.anilistId.trim(), 10);
  const malId =
    typeof input.mal_id === 'number' && Number.isFinite(input.mal_id) && input.mal_id > 0
      ? Math.floor(input.mal_id)
      : null;
  return { format: input.showType?.trim() || null, seasonYear, episodeCount, anilistId, malId };
}

export interface HikkaCatalogResolved {
  hikkaSlug: string;
  pick: HikkaCatalogPick;
  episodes: EpisodesTypes[];
  totalEpisodes: number;
}

async function resolveHikkaCatalogUncached(
  input: HikkaCatalogMatchInput
): Promise<HikkaCatalogResolved | null> {
  const hints = hintsFromInput(input);
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

function catalogCacheKey(input: HikkaCatalogMatchInput): string {
  const terms = buildAnimepaheSearchTermsFromFields({
    title: input.title,
    romaji_title: input.romaji_title,
    japanese_title: input.japanese_title,
    synonyms: input.synonyms,
  });
  const mal = input.mal_id != null ? String(input.mal_id) : '';
  return `hikka-catalog-v1:${input.anilistId.trim()}:${mal}:${terms[0] ?? input.title}`;
}

export async function resolveHikkaCatalogCached(
  input: HikkaCatalogMatchInput
): Promise<HikkaCatalogResolved | null> {
  const key = catalogCacheKey(input);
  const cached = unstable_cache(
    async () => resolveHikkaCatalogUncached(input),
    [key],
    { revalidate: 600, tags: ['hikka-catalog', key] }
  );
  return cached();
}
