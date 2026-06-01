import type { MutableRefObject, RefObject } from 'react';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import type { StableWatchLoadSnapshot, WarmAlternateCatalogEntry } from './types';
import type { WatchAnimeCatalogLoadParams } from './watchAnimeCatalogLoadTypes';
import type { WatchCatalogLoadEffectDeps } from './watchCatalogLoadDeps';

export interface ProviderOnlyCatalogLoadInput {
  deps: WatchCatalogLoadEffectDeps;
  animeInfoRef: RefObject<AnimeData | null>;
  episodeIdRef: RefObject<string | null>;
  stableWatchLoadRef: MutableRefObject<StableWatchLoadSnapshot | null>;
  warmCatalogsRef: MutableRefObject<WarmAlternateCatalogEntry | null>;
  setProviderCatalogPending: WatchAnimeCatalogLoadParams['setProviderCatalogPending'];
  markCancelled: () => void;
  abortSignal: () => void;
}
