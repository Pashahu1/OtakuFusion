import { resolveHikkaCatalogCached } from '@/server/hikka/catalogMatchCached';
import { HikkaFeaturesForbiddenError } from '@/services/hikka/hikkaOutboundFetch';
import type {
  CatalogRouteContext,
  CatalogRouteFailure,
  CatalogRoutePayload,
} from '@/server/catalog/createCatalogRoute';

export function mapHikkaCatalogHttpStatus(payload: CatalogRoutePayload): number {
  if (payload.success) return 200;
  if (payload.error === 'hikka_catalog_not_found') return 404;
  if (payload.error === 'hikka_features_forbidden') return 403;
  return 502;
}

export function mapHikkaCatalogCaughtError(err: unknown): CatalogRouteFailure {
  if (err instanceof HikkaFeaturesForbiddenError) {
    return {
      success: false,
      error: 'hikka_features_forbidden',
      reason:
        'Hikka Features API blocks this server IP (common on Vercel). Set HIKKA_FEATURES_RELAY_BASE to a small Cloudflare Worker proxy — see workers/hikka-features-relay.',
    };
  }
  return {
    success: false,
    error: err instanceof Error ? err.message : 'hikka_catalog_failed',
  };
}

/** Hikka: resolve + pick team + map episodes — все в resolveHikkaCatalogCached. */
export async function runHikkaCatalog(
  ctx: CatalogRouteContext
): Promise<CatalogRoutePayload> {
  const resolved = await resolveHikkaCatalogCached(ctx.body);
  if (!resolved) {
    return { success: false, error: 'hikka_catalog_not_found' };
  }

  return {
    success: true,
    hikkaSlug: resolved.hikkaSlug,
    source: resolved.pick.source,
    team: resolved.pick.team,
    episodes: resolved.episodes,
    totalEpisodes: resolved.totalEpisodes,
    availableTeams: resolved.pick.availableTeams,
  };
}
