import { z } from 'zod';
import { crysolineAnilibertySearch } from '@/server/crysoline/anilibertyClient';
import type { CrysolineAnilibertySearchRow } from '@/server/crysoline/anilibertyClient';
import { getCrysolineApiKey } from '@/server/crysoline/config';
import { getAnilibertyEpisodesCached } from '@/server/aniliberty/episodesCached';
import {
  buildAnimepaheSearchQueryQueue,
  buildAnimepaheSearchTermsFromFields,
  normalizeCatalogSearchQuery,
  type AnimepaheCatalogHints,
} from '@/services/animepahe/catalogHints';
import { pickBestAnilibertySearchHit } from '@/services/aniliberty/pickAnilibertySearchHit';
import { mapCrysolineAnilibertyEpisodes } from '@/services/aniliberty/mapAnilibertyEpisodes';

const BodySchema = z.object({
  anilistId: z.string().min(1),
  title: z.string().min(1),
  romaji_title: z.string().optional(),
  japanese_title: z.string().optional(),
  showType: z.string().optional(),
  premiered: z.string().optional(),
  episodeTotal: z.string().optional(),
  mal_id: z.number().nullable().optional(),
  synonyms: z.string().optional(),
});

function hintsFromBody(b: z.infer<typeof BodySchema>): AnimepaheCatalogHints {
  const prem = b.premiered?.trim();
  let seasonYear: number | null = null;
  if (prem && /^\d{4}$/.test(prem)) {
    seasonYear = parseInt(prem, 10);
  }
  const et = b.episodeTotal?.trim();
  let episodeCount: number | null = null;
  if (et && /^\d+$/.test(et)) {
    episodeCount = parseInt(et, 10);
  }
  let anilistId: number | null = null;
  if (/^\d+$/.test(b.anilistId.trim())) {
    anilistId = parseInt(b.anilistId.trim(), 10);
  }
  const malId =
    typeof b.mal_id === 'number' && Number.isFinite(b.mal_id) && b.mal_id > 0
      ? Math.floor(b.mal_id)
      : null;
  return {
    format: b.showType?.trim() || null,
    seasonYear,
    episodeCount,
    anilistId,
    malId,
  };
}

const MAX_SEARCH_QUERIES = 3;
const MERGED_HITS_SOFT_CAP = 10;

export async function POST(req: Request) {
  try {
    getCrysolineApiKey();
  } catch {
    return Response.json(
      { success: false, error: 'crysoline_api_key_missing' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json(
      { success: false, error: 'invalid_json' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json(
      { success: false, error: 'invalid_body' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const body = parsed.data;
  const hints = hintsFromBody(body);
  const baseTerms = buildAnimepaheSearchTermsFromFields({
    title: body.title,
    romaji_title: body.romaji_title,
    japanese_title: body.japanese_title,
    synonyms: body.synonyms,
  });
  const queue = buildAnimepaheSearchQueryQueue(baseTerms);
  if (!queue.length) {
    return Response.json(
      { success: false, error: 'aniliberty_no_search_terms' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const merged = new Map<number, CrysolineAnilibertySearchRow>();
  const termsForScore = baseTerms;

  try {
    for (let i = 0; i < Math.min(queue.length, MAX_SEARCH_QUERIES); i++) {
      const q = normalizeCatalogSearchQuery(queue[i]);
      if (q.length < 2) continue;
      const hits = await crysolineAnilibertySearch(q);
      for (const h of hits) {
        if (typeof h?.id === 'number' && Number.isFinite(h.id) && !merged.has(h.id)) {
          merged.set(h.id, h);
        }
      }
      if (merged.size >= MERGED_HITS_SOFT_CAP) break;
    }
  } catch (e) {
    return Response.json(
      {
        success: false,
        error: e instanceof Error ? e.message : 'aniliberty_search_failed',
      },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const pool = [...merged.values()];
  const best = pickBestAnilibertySearchHit(pool, hints, termsForScore);
  if (best == null || !Number.isFinite(best.id)) {
    return Response.json(
      { success: false, error: 'aniliberty_catalog_not_found' },
      { status: 404, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const libertyId = String(Math.floor(best.id));

  try {
    const rows = await getAnilibertyEpisodesCached(libertyId);
    const { episodes, totalEpisodes } = mapCrysolineAnilibertyEpisodes(rows);
    if (!episodes.length) {
      return Response.json(
        { success: false, error: 'aniliberty_episodes_empty' },
        { status: 404, headers: { 'Cache-Control': 'no-store' } }
      );
    }
    return Response.json(
      {
        success: true,
        libertyId,
        episodes,
        totalEpisodes,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (e) {
    return Response.json(
      {
        success: false,
        error: e instanceof Error ? e.message : 'aniliberty_episodes_failed',
      },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
