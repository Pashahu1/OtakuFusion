import { createCatalogRoute } from '@/server/catalog/createCatalogRoute';
import {
  AnikotoCatalogBodySchema,
  mapAnikotoCatalogCaughtError,
  mapAnikotoCatalogHttpStatus,
  runAnikotoCatalog,
} from '@/server/catalog/handlers/anikotoCatalogHandler';
import { anikotoConfigGuard } from '@/server/anikoto/routeHelpers';

const handleCatalog = createCatalogRoute({
  bodySchema: AnikotoCatalogBodySchema,
  requireSearchTerms: true,
  emptySearchTermsError: 'anikoto_catalog_no_search_terms',
  dedupeInflight: true,
  handler: runAnikotoCatalog,
  mapHttpStatus: mapAnikotoCatalogHttpStatus,
  mapCaughtError: mapAnikotoCatalogCaughtError,
});

export async function POST(req: Request) {
  const guard = anikotoConfigGuard();
  if (guard) return guard;
  return handleCatalog(req);
}
