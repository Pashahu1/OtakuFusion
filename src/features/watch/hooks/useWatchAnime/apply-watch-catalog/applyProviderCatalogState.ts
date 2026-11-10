import {
  writeVerifiedAnikotoMapping,
  writeVerifiedHikkaMapping,
} from '@/features/watch/lib/provider-mapping-cache';
import { restoreCachedAlternateLanguageMenu } from '../watchAnimeCatalogUtils';
import type {
  ApplyWatchCatalogSuccessContext,
  ApplyWatchCatalogSuccessOpts,
} from './applyWatchCatalogSuccessTypes';

export function applyProviderCatalogState(
  ctx: ApplyWatchCatalogSuccessContext,
  providerId: string,
  opts: Pick<
    ApplyWatchCatalogSuccessOpts,
    'forceFuzzy' | 'freshHikkaCatalog'
  >,
): void {
  const {
    animeId,
    watchStreamProvider,
    menuSetters,
    setHikkaCatalogProviderId,
    setAnikotoCatalogProviderId,
    setHikkaLanguageMenuEligible,
    setAnikotoLanguageMenuEligible,
  } = ctx;
  const { forceFuzzy, freshHikkaCatalog } = opts;

  if (watchStreamProvider === 'hikka') {
    if (freshHikkaCatalog) {
      writeVerifiedHikkaMapping(animeId, providerId);
    }
    setHikkaCatalogProviderId(providerId);
    setHikkaLanguageMenuEligible(true);
    if (!forceFuzzy) {
      restoreCachedAlternateLanguageMenu(animeId, 'hikka', menuSetters);
    }
    return;
  }

  if (watchStreamProvider === 'anikoto') {
    writeVerifiedAnikotoMapping(animeId, providerId);
    setAnikotoCatalogProviderId(providerId);
    setAnikotoLanguageMenuEligible(true);
    if (!forceFuzzy) {
      restoreCachedAlternateLanguageMenu(animeId, 'anikoto', menuSetters);
    }
  }
}
