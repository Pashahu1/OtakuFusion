import { z } from 'zod';
import { getCrysolineApiKey } from '@/server/crysoline/config';
import { getAnilibertyEpisodesCached } from '@/server/aniliberty/episodesCached';
import { resolveAnilibertyLibertyIdCached } from '@/server/aniliberty/catalogMatchCached';
import {
  buildAnimepaheSearchTermsFromFields,
  type AnimepaheCatalogHints,
} from '@/services/animepahe/catalogHints';
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
      { success: false, error: 'aniliberty_no_search_terms' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  try {
    const libertyId = await resolveAnilibertyLibertyIdCached(body, hints, baseTerms);
    if (!libertyId) {
      return Response.json(
        { success: false, error: 'aniliberty_catalog_not_found' },
        { status: 404, headers: { 'Cache-Control': 'no-store' } }
      );
    }

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
        error: e instanceof Error ? e.message : 'aniliberty_catalog_failed',
      },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
