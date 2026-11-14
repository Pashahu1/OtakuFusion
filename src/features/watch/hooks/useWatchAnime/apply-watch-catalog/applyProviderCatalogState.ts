import { writeVerifiedHikkaMapping } from '@/features/watch/lib/provider-mapping-cache';
import type {
  ApplyWatchCatalogSuccessContext,
  ApplyWatchCatalogSuccessOpts,
} from './applyWatchCatalogSuccessTypes';

export function applyProviderCatalogState(
  ctx: ApplyWatchCatalogSuccessContext,
  providerId: string,
  opts: Pick<
    ApplyWatchCatalogSuccessOpts,
    'forceFuzzy' | 'freshHikkaCatalog' | 'ukrainianPlayable'
  >,
): void {
  const {
    animeId,
    setHikkaCatalogProviderId,
    setHikkaLanguageMenuEligible,
  } = ctx;
  const { freshHikkaCatalog } = opts;

  if (freshHikkaCatalog) {
    writeVerifiedHikkaMapping(animeId, providerId);
  }
  setHikkaCatalogProviderId(providerId);
  setHikkaLanguageMenuEligible(opts.ukrainianPlayable !== false);
}
