import {
  readVerifiedAnikotoMapping,
  writeVerifiedAnikotoMapping,
  writeVerifiedHikkaMapping,
  writeVerifiedLibertyMapping,
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
    'forceFuzzy' | 'freshLibertyCatalog' | 'freshHikkaCatalog'
  >,
): void {
  const {
    animeId,
    watchStreamProvider,
    menuSetters,
    setAnilibertyCatalogProviderId,
    setHikkaCatalogProviderId,
    setAnikotoCatalogProviderId,
    setAnilibertyLanguageMenuEligible,
    setHikkaLanguageMenuEligible,
    setAnikotoLanguageMenuEligible,
  } = ctx;
  const { forceFuzzy, freshLibertyCatalog, freshHikkaCatalog } = opts;

  if (watchStreamProvider === 'aniliberty') {
    if (freshLibertyCatalog) {
      writeVerifiedLibertyMapping(animeId, providerId);
    }
    setAnilibertyCatalogProviderId(providerId);
    setAnilibertyLanguageMenuEligible(true);
    if (!forceFuzzy) {
      restoreCachedAlternateLanguageMenu(animeId, 'aniliberty', menuSetters);
    }
    return;
  }

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
