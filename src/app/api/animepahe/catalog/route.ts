import { z } from 'zod';
import { getCrysolineApiKey } from '@/server/crysoline/config';
import { getAnimePaheEpisodesCached } from '@/server/animepahe/episodesCached';
import { resolveAnimepahePaheIdCached } from '@/server/animepahe/catalogMatchCached';
import {
  buildAnimepaheSearchTermsFromFields,
  type AnimepaheCatalogHints,
} from '@/services/animepahe/catalogHints';
import { enrichEpisodesWithSeriesDubIfNeeded } from '@/server/animepahe/dubProbe';

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

function hintsFromBody(
  b: z.infer<typeof BodySchema>
): AnimepaheCatalogHints {
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
  if (!baseTerms.length) {
    return Response.json(
      { success: false, error: 'animepahe_no_search_terms' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const skipDubProbe =
    process.env.ANIMEPAHE_SKIP_SERIES_DUB_PROBE === '1' ||
    process.env.ANIMEPAHE_SKIP_SERIES_DUB_PROBE === 'true';

  try {
    const paheId = await resolveAnimepahePaheIdCached(body, hints, baseTerms);
    if (!paheId) {
      return Response.json(
        { success: false, error: 'animepahe_catalog_not_found' },
        { status: 404, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const { episodes, totalEpisodes } = await getAnimePaheEpisodesCached(paheId);
    const episodesOut = skipDubProbe
      ? episodes
      : await enrichEpisodesWithSeriesDubIfNeeded(paheId, episodes);
    const hasSeriesDub =
      !skipDubProbe && episodesOut.some((e) => e.hasDub === true);
    return Response.json(
      {
        success: true,
        paheId,
        episodes: episodesOut,
        totalEpisodes,
        hasSeriesDub,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (e) {
    return Response.json(
      {
        success: false,
        error: e instanceof Error ? e.message : 'animepahe_episodes_failed',
      },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
