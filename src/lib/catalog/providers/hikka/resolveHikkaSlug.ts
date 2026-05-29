import {
  buildCatalogSearchTermsFromFields,
  type CatalogHints,
} from '@/lib/catalog/catalog-hints';
import { hikkaIoFetch, hikkaIoUrl } from '@/lib/catalog/providers/hikka/hikkaIoFetch';

interface HikkaAnimeRow {
  slug?: string;
  mal_id?: number | null;
  title_en?: string | null;
  title_ja?: string | null;
  title_ua?: string | null;
  year?: number | null;
  episodes_total?: number | null;
}

function scoreHikkaSearchHit(
  row: HikkaAnimeRow,
  terms: string[],
  hints: CatalogHints
): number {
  const hay = [
    row.title_en,
    row.title_ja,
    row.title_ua,
    row.slug?.replace(/-[a-f0-9]{6}$/i, '').replace(/-/g, ' '),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  if (!hay) return 0;

  let score = 0;
  for (const term of terms) {
    const t = term.toLowerCase().trim();
    if (!t) continue;
    if (hay === t) score += 80;
    else if (hay.includes(t)) score += 40;
  }

  if (hints.malId != null && row.mal_id === hints.malId) score += 200;
  if (hints.seasonYear != null && row.year === hints.seasonYear) score += 12;
  if (
    hints.episodeCount != null &&
    row.episodes_total != null &&
    Math.abs(row.episodes_total - hints.episodeCount) <= 2
  ) {
    score += 25;
  }
  return score;
}

async function fetchHikkaSlugByMal(malId: number): Promise<string | null> {
  const res = await hikkaIoFetch(hikkaIoUrl(`/integrations/mal/anime/${malId}`));
  if (!res.ok) return null;
  const data = (await res.json()) as HikkaAnimeRow;
  const slug = data.slug?.trim();
  return slug || null;
}

async function searchHikkaSlug(
  query: string,
  hints: CatalogHints,
  terms: string[]
): Promise<string | null> {
  const q = query.trim();
  if (!q) return null;
  const res = await hikkaIoFetch(hikkaIoUrl('/anime'), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query: q }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { list?: HikkaAnimeRow[] };
  const list = Array.isArray(data.list) ? data.list : [];
  if (!list.length) return null;

  let best: { slug: string; score: number } | null = null;
  for (const row of list) {
    const slug = row.slug?.trim();
    if (!slug) continue;
    const score = scoreHikkaSearchHit(row, terms, hints);
    if (!best || score > best.score) best = { slug, score };
  }
  if (!best || best.score < 40) return null;
  return best.slug;
}

export async function resolveHikkaSlug(params: {
  malId?: number | null;
  title: string;
  romaji_title?: string;
  japanese_title?: string;
  synonyms?: string;
  hints: CatalogHints;
}): Promise<string | null> {
  if (params.malId != null && params.malId > 0) {
    const byMal = await fetchHikkaSlugByMal(Math.floor(params.malId));
    if (byMal) return byMal;
  }

  const terms = buildCatalogSearchTermsFromFields({
    title: params.title,
    romaji_title: params.romaji_title,
    japanese_title: params.japanese_title,
    synonyms: params.synonyms,
  });
  for (const term of terms.slice(0, 4)) {
    const slug = await searchHikkaSlug(term, params.hints, terms);
    if (slug) return slug;
  }
  return null;
}
