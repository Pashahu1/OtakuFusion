import { resolveAnikotoCatalogCached } from '@/server/anikoto/catalogMatchCached';
import type {
  CatalogRouteContext,
  CatalogRouteFailure,
  CatalogRoutePayload,
} from '@/server/catalog/createCatalogRoute';
import { z } from 'zod';
import { CatalogRequestBodySchema } from '@/server/catalog/catalogRequestSchema';

export const AnikotoCatalogBodySchema = CatalogRequestBodySchema.extend({
  anikotoSlug: z.string().optional(),
});

export type AnikotoCatalogBody = z.infer<typeof AnikotoCatalogBodySchema>;

export function mapAnikotoCatalogHttpStatus(payload: CatalogRoutePayload): number {
  if (payload.success) return 200;
  if (payload.error === 'anikoto_catalog_not_found') return 404;
  return 502;
}

export function mapAnikotoCatalogCaughtError(err: unknown): CatalogRouteFailure {
  return {
    success: false,
    error: err instanceof Error ? err.message : 'anikoto_catalog_failed',
  };
}

export async function runAnikotoCatalog(
  ctx: CatalogRouteContext & { body: AnikotoCatalogBody },
): Promise<CatalogRoutePayload> {
  const resolved = await resolveAnikotoCatalogCached(ctx.body, ctx.body.anikotoSlug ?? null);
  if (!resolved) {
    return { success: false, error: 'anikoto_catalog_not_found' };
  }

  return {
    success: true,
    anikotoSlug: resolved.anikotoSlug,
    totalSub: resolved.totalSub,
    totalDub: resolved.totalDub,
  };
}
