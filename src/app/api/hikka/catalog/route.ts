import { createCatalogRoute } from '@/server/catalog/createCatalogRoute';
import {
  mapHikkaCatalogCaughtError,
  mapHikkaCatalogHttpStatus,
  runHikkaCatalog,
} from '@/server/catalog/handlers/hikkaCatalogHandler';

export const POST = createCatalogRoute({
  handler: runHikkaCatalog,
  mapHttpStatus: mapHikkaCatalogHttpStatus,
  mapCaughtError: mapHikkaCatalogCaughtError,
});
