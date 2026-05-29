import type { AnimepaheCatalogHints } from '@/lib/catalog/providers/animepahe/catalogHints';
import { getAnimePaheEpisodesCached } from '@/server/animepahe/episodesCached';
import { resolveAnimepahePaheIdCached } from '@/server/animepahe/catalogMatchCached';
import { enrichEpisodesWithSeriesDubIfNeeded } from '@/server/animepahe/dubProbe';
import type {
  CatalogRouteContext,
  CatalogRoutePayload,
} from '@/server/catalog/createCatalogRoute';

const skipDubProbe =
  process.env.ANIMEPAHE_SKIP_SERIES_DUB_PROBE === '1' ||
  process.env.ANIMEPAHE_SKIP_SERIES_DUB_PROBE === 'true';

export function mapAnimepaheCatalogHttpStatus(payload: CatalogRoutePayload): number {
  if (payload.success) return 200;
  if (payload.error === 'animepahe_catalog_not_found') return 404;
  return 502;
}

export async function runAnimepaheCatalog(
  ctx: CatalogRouteContext
): Promise<CatalogRoutePayload> {
  const { body, hints, baseTerms } = ctx;
  try {
    const paheId = await resolveAnimepahePaheIdCached(
      body,
      hints as AnimepaheCatalogHints,
      baseTerms
    );
    if (!paheId) {
      return { success: false, error: 'animepahe_catalog_not_found' };
    }

    const { episodes, totalEpisodes } = await getAnimePaheEpisodesCached(paheId);
    const episodesOut = skipDubProbe
      ? episodes
      : await enrichEpisodesWithSeriesDubIfNeeded(paheId, episodes);
    const hasSeriesDub =
      !skipDubProbe && episodesOut.some((e) => e.hasDub === true);

    return {
      success: true,
      paheId,
      episodes: episodesOut,
      totalEpisodes,
      hasSeriesDub,
    };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'animepahe_episodes_failed',
    };
  }
}
