import { CatalogRequestBodyWithAnilistStatusSchema } from '@/server/catalog/catalogRequestSchema';
import { createCatalogRoute } from '@/server/catalog/createCatalogRoute';
import {
  mapAnilibertyCatalogHttpStatus,
  runAnilibertyCatalog,
} from '@/server/catalog/handlers/anilibertyCatalogHandler';

export const POST = createCatalogRoute({
  bodySchema: CatalogRequestBodyWithAnilistStatusSchema,
  requireCrysolineApiKey: true,
  requireSearchTerms: true,
  emptySearchTermsError: 'aniliberty_no_search_terms',
  dedupeInflight: true,
  handler: runAnilibertyCatalog,
  mapHttpStatus: mapAnilibertyCatalogHttpStatus,
});
