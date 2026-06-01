import {
  readVerifiedHikkaMapping,
  readVerifiedLibertyMapping,
  writeVerifiedHikkaMapping,
  writeVerifiedLibertyMapping,
  writeVerifiedPaheMapping,
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
    'forceFuzzy' | 'freshPaheCatalog' | 'freshLibertyCatalog' | 'freshHikkaCatalog'
  >,
): void {
  const {
    animeId,
    watchStreamProvider,
    menuSetters,
    setAnimepaheCatalogProviderId,
    setAnilibertyCatalogProviderId,
    setHikkaCatalogProviderId,
    setAnilibertyLanguageMenuEligible,
    setHikkaLanguageMenuEligible,
  } = ctx;
  const { forceFuzzy, freshPaheCatalog, freshLibertyCatalog, freshHikkaCatalog } = opts;

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

  if (freshPaheCatalog) {
    writeVerifiedPaheMapping(animeId, providerId, freshPaheCatalog.hasSeriesDub === true);
  }
  setAnimepaheCatalogProviderId(providerId);
  if (!forceFuzzy) {
    const cachedHikka = readVerifiedHikkaMapping(animeId);
    const cachedLiberty = readVerifiedLibertyMapping(animeId);
    if (cachedHikka?.hikkaSlug) {
      setHikkaCatalogProviderId(cachedHikka.hikkaSlug);
      setHikkaLanguageMenuEligible(true);
    }
    if (cachedLiberty?.libertyId) {
      setAnilibertyCatalogProviderId(cachedLiberty.libertyId);
      setAnilibertyLanguageMenuEligible(true);
    }
  }
}
