import { createCatalogRoute } from '@/server/catalog/createCatalogRoute';
import {
  mapAnimepaheCatalogHttpStatus,
  runAnimepaheCatalog,
} from '@/server/catalog/handlers/animepaheCatalogHandler';

export const POST = createCatalogRoute({
  requireCrysolineApiKey: true,
  requireSearchTerms: true,
  emptySearchTermsError: 'animepahe_no_search_terms',
  dedupeInflight: true,
  handler: runAnimepaheCatalog,
  mapHttpStatus: mapAnimepaheCatalogHttpStatus,
});
