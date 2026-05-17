import { z } from 'zod';
import { resolveHikkaCatalogCached } from '@/server/hikka/catalogMatchCached';
import { HikkaFeaturesForbiddenError } from '@/services/hikka/hikkaOutboundFetch';

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

export async function POST(req: Request) {
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

  try {
    const resolved = await resolveHikkaCatalogCached(parsed.data);
    if (!resolved) {
      return Response.json(
        { success: false, error: 'hikka_catalog_not_found' },
        { status: 404, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    return Response.json(
      {
        success: true,
        hikkaSlug: resolved.hikkaSlug,
        source: resolved.pick.source,
        team: resolved.pick.team,
        episodes: resolved.episodes,
        totalEpisodes: resolved.totalEpisodes,
        availableTeams: resolved.pick.availableTeams,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (e) {
    if (e instanceof HikkaFeaturesForbiddenError) {
      return Response.json(
        {
          success: false,
          error: 'hikka_features_forbidden',
          reason:
            'Hikka Features API blocks this server IP (common on Vercel). Set HIKKA_FEATURES_RELAY_BASE to a small Cloudflare Worker proxy — see workers/hikka-features-relay.',
        },
        { status: 403, headers: { 'Cache-Control': 'no-store' } }
      );
    }
    return Response.json(
      {
        success: false,
        error: e instanceof Error ? e.message : 'hikka_catalog_failed',
      },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
