import { getAnilibertyEpisodesCached } from '@/server/aniliberty/episodesCached';
import { resolveAnilibertyLibertyIdCached } from '@/server/aniliberty/catalogMatchCached';
import { mapCrysolineAnilibertyEpisodes } from '@/services/aniliberty/mapAnilibertyEpisodes';
import {
  buildAnilibertyEpisodeMatchOptions,
  isAnilibertyEpisodeCountAcceptable,
  parseExpectedEpisodeCountFromHints,
} from '@/services/aniliberty/anilibertyEpisodeMatch';
import type { CatalogRequestBodyWithAnilistStatus } from '@/server/catalog/catalogRequestSchema';
import type {
  CatalogRouteContext,
  CatalogRoutePayload,
} from '@/server/catalog/createCatalogRoute';

const ANILIBERTY_NOT_FOUND_ERRORS = new Set([
  'aniliberty_catalog_not_found',
  'aniliberty_episodes_empty',
  'aniliberty_episode_count_mismatch',
]);

export function mapAnilibertyCatalogHttpStatus(payload: CatalogRoutePayload): number {
  if (payload.success) return 200;
  if (ANILIBERTY_NOT_FOUND_ERRORS.has(payload.error)) return 404;
  return 502;
}

export async function runAnilibertyCatalog(
  ctx: CatalogRouteContext & { body: CatalogRequestBodyWithAnilistStatus }
): Promise<CatalogRoutePayload> {
  const { body, hints, baseTerms } = ctx;
  try {
    const libertyId = await resolveAnilibertyLibertyIdCached(body, hints, baseTerms);
    if (!libertyId) {
      return { success: false, error: 'aniliberty_catalog_not_found' };
    }

    const rows = await getAnilibertyEpisodesCached(libertyId);
    const { episodes, totalEpisodes } = mapCrysolineAnilibertyEpisodes(rows);
    if (!episodes.length) {
      return { success: false, error: 'aniliberty_episodes_empty' };
    }

    const expectedEpisodes = parseExpectedEpisodeCountFromHints(hints);
    const epMatchOpts = buildAnilibertyEpisodeMatchOptions(hints);
    if (
      !isAnilibertyEpisodeCountAcceptable(
        expectedEpisodes,
        totalEpisodes,
        epMatchOpts
      )
    ) {
      return { success: false, error: 'aniliberty_episode_count_mismatch' };
    }

    return {
      success: true,
      libertyId,
      episodes,
      totalEpisodes,
    };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'aniliberty_catalog_failed',
    };
  }
}
