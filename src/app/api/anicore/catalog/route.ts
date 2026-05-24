import { z } from 'zod';
import { getCrysolineApiKey } from '@/server/crysoline/config';
import { getAnicoreEpisodesCached } from '@/server/anicore/episodesCached';
import { resolveAnicoreCatalogIdCached } from '@/server/anicore/catalogMatchCached';
import {
  buildAnimepaheSearchTermsFromFields,
  type AnimepaheCatalogHints,
} from '@/services/catalog/catalogHints';
import {
  seriesHasDubFromAnicoreEpisodes,
} from '@/services/anicore/mapCrysolineAnicoreEpisodes';
import { getAnicoreEpisodeRowsCached } from '@/server/anicore/episodesCached';

type CatalogJsonResponse = {
  success: boolean;
  error?: string;
  anicoreId?: string;
  episodes?: unknown[];
  totalEpisodes?: number;
  hasSeriesDub?: boolean;
};

const inflightCatalogByAnilistId = new Map<string, Promise<CatalogJsonResponse>>();

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
  if (!baseTerms.length && hints.anilistId == null) {
    return Response.json(
      { success: false, error: 'anicore_no_search_terms' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const anilistKey = body.anilistId.trim();

  const runCatalog = async (): Promise<CatalogJsonResponse> => {
    try {
      const anicoreId = await resolveAnicoreCatalogIdCached(body, hints, baseTerms);
      if (!anicoreId) {
        return { success: false, error: 'anicore_catalog_not_found' };
      }

      const { episodes, totalEpisodes } = await getAnicoreEpisodesCached(anicoreId);
      const rawRows = await getAnicoreEpisodeRowsCached(anicoreId).catch(() => []);
      const hasSeriesDub = seriesHasDubFromAnicoreEpisodes(rawRows);

      return {
        success: true,
        anicoreId,
        episodes,
        totalEpisodes,
        hasSeriesDub,
      };
    } catch (e) {
      return {
        success: false,
        error: e instanceof Error ? e.message : 'anicore_episodes_failed',
      };
    }
  };

  const existing = inflightCatalogByAnilistId.get(anilistKey);
  if (existing) {
    const shared = await existing;
    const status = shared.success
      ? 200
      : shared.error === 'anicore_catalog_not_found'
        ? 404
        : 502;
    return Response.json(shared, {
      status,
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  const promise = runCatalog().finally(() => {
    if (inflightCatalogByAnilistId.get(anilistKey) === promise) {
      inflightCatalogByAnilistId.delete(anilistKey);
    }
  });
  inflightCatalogByAnilistId.set(anilistKey, promise);

  const result = await promise;
  const status = result.success
    ? 200
    : result.error === 'anicore_catalog_not_found'
      ? 404
      : 502;
  return Response.json(result, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}
