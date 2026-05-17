import { getAniListSearchPage, mapAniListMediaToSearchItem } from '@/lib/anilist';
import type { AnimeSearchItems } from '@/shared/types/AnimeSearchTypes';
import {
  filterAnimeSearchResults,
  normalizeAnimeSearchQuery,
  rankAnimeSearchMedia,
} from '@/services/animeSearchRank';
import { buildAnimeSearchQueryVariants } from '@/services/buildAnimeSearchQueryVariants';

export const ANIME_SEARCH_MIN_QUERY_LENGTH = 2;
export const ANIME_SEARCH_RESULT_LIMIT = 24;
const SEARCH_FETCH_PER_PAGE = 50;
const MAX_SEARCH_API_CALLS = 3;

type SearchMedia = NonNullable<
  Awaited<ReturnType<typeof getAniListSearchPage>>['media']
>[number] & { id: number };

async function fetchSearchPool(search: string, page = 1): Promise<SearchMedia[]> {
  const result = await getAniListSearchPage({
    search,
    page,
    perPage: SEARCH_FETCH_PER_PAGE,
  });
  return (result.media ?? []).filter(
    (m): m is SearchMedia => typeof m.id === 'number' && Number.isFinite(m.id)
  );
}

function buildSearchTerms(query: string): string[] {
  const terms: string[] = [];
  const add = (value: string) => {
    const x = normalizeAnimeSearchQuery(value);
    if (x.length < ANIME_SEARCH_MIN_QUERY_LENGTH || terms.includes(x)) return;
    terms.push(x);
  };

  add(query);
  if (query.length > 5) {
    for (const variant of buildAnimeSearchQueryVariants(query)) {
      add(variant);
      if (terms.length >= MAX_SEARCH_API_CALLS) break;
    }
  }

  return terms.slice(0, MAX_SEARCH_API_CALLS);
}

async function collectSearchPool(query: string): Promise<SearchMedia[]> {
  const byId = new Map<number, SearchMedia>();

  for (const term of buildSearchTerms(query)) {
    const batch = await fetchSearchPool(term);
    for (const item of batch) byId.set(item.id, item);
    if (byId.size >= SEARCH_FETCH_PER_PAGE) break;
  }

  if (byId.size < 8 && query.length <= 4) {
    const page2 = await fetchSearchPool(query, 2);
    for (const item of page2) byId.set(item.id, item);
  }

  return [...byId.values()];
}

export async function getAnimeSearch(query: string): Promise<AnimeSearchItems[]> {
  const trimmed = normalizeAnimeSearchQuery(query);
  if (!trimmed || trimmed.length < ANIME_SEARCH_MIN_QUERY_LENGTH) return [];

  const pool = await collectSearchPool(trimmed);
  if (pool.length === 0) return [];

  const ranked = rankAnimeSearchMedia(pool, trimmed);
  const relevant = filterAnimeSearchResults(ranked, trimmed);
  const finalList = relevant.length > 0 ? relevant : ranked;

  return finalList
    .slice(0, ANIME_SEARCH_RESULT_LIMIT)
    .map(mapAniListMediaToSearchItem);
}
