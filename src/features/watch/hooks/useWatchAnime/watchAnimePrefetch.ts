import { postAnimepaheCatalog } from '@/lib/animepahe-catalog-bff';
import { postAnilibertyCatalog, type AnilibertyCatalogBffOk } from '@/features/watch/lib/aniliberty-catalog-bff';
import { postHikkaCatalog, type HikkaCatalogBffOk } from '@/features/watch/lib/hikka-catalog-bff';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import {
  catalogBodyFromAnimeData,
  isLibertyCatalogAcceptableForAnime,
} from './watchAnimeCatalogUtils';
import type { MutableRefObject } from 'react';
import type { WarmAlternateCatalogEntry } from './types';
import {
  clearVerifiedLibertyMapping,
  readVerifiedPaheMapping,
  writeVerifiedHikkaMapping,
  writeVerifiedLibertyMapping,
  writeVerifiedPaheMapping,
} from './watchAnimeMappingCache';
import { writeLibertyEpisodesCache } from './anilibertyEpisodesCache';
import { upsertWarmHikkaCatalog, upsertWarmLibertyCatalog } from './watchAnimeWarmCatalog';

async function delayMs(ms: number, signal: AbortSignal): Promise<void> {
  if (signal.aborted) return;
  await new Promise<void>((resolve, reject) => {
    const id = window.setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      window.clearTimeout(id);
      signal.removeEventListener('abort', onAbort);
      reject(new DOMException('Aborted', 'AbortError'));
    };
    signal.addEventListener('abort', onAbort, { once: true });
  });
}

export function prefetchAnilibertyMapping(
  dataForResolve: AnimeData,
  localAnimeId: string,
  signal: AbortSignal,
  isCancelled: () => boolean,
  onEligible: () => void,
  onWarm?: (catalog: AnilibertyCatalogBffOk) => void,
  warmCatalogsRef?: MutableRefObject<WarmAlternateCatalogEntry | null>
): void {
  const catalogPayload = catalogBodyFromAnimeData(dataForResolve, localAnimeId);
  void (async () => {
    try {
      let alt = await postAnilibertyCatalog(catalogPayload, signal);
      if (isCancelled() || signal.aborted) return;
      const errMsg = !alt.success ? alt.error : '';
      const shouldRetry =
        !alt.success &&
        (errMsg.includes('502') ||
          errMsg.includes('503') ||
          errMsg.includes('429') ||
          errMsg.includes('catalog_failed'));
      if (shouldRetry) {
        await delayMs(600, signal);
        if (isCancelled() || signal.aborted) return;
        alt = await postAnilibertyCatalog(catalogPayload, signal);
      }
      if (isCancelled() || signal.aborted) return;
      if (!alt.success || !alt.libertyId?.trim()) return;
      const actualCount = alt.totalEpisodes ?? alt.episodes?.length ?? 0;
      if (!isLibertyCatalogAcceptableForAnime(dataForResolve, actualCount)) {
        clearVerifiedLibertyMapping(localAnimeId);
        return;
      }
      const libertyId = alt.libertyId.trim();
      writeVerifiedLibertyMapping(localAnimeId, libertyId);
      const episodes = alt.episodes ?? [];
      if (episodes.length > 0) {
        writeLibertyEpisodesCache(localAnimeId, libertyId, episodes, actualCount);
        if (warmCatalogsRef) {
          upsertWarmLibertyCatalog(warmCatalogsRef, localAnimeId, libertyId, episodes);
        }
      }
      onWarm?.(alt);
      onEligible();
    } catch {

    }
  })();
}

export function prefetchHikkaMapping(
  dataForResolve: AnimeData,
  localAnimeId: string,
  signal: AbortSignal,
  isCancelled: () => boolean,
  onEligible: () => void,
  onWarm?: (catalog: HikkaCatalogBffOk) => void,
  warmCatalogsRef?: MutableRefObject<WarmAlternateCatalogEntry | null>
): void {
  const catalogPayload = catalogBodyFromAnimeData(dataForResolve, localAnimeId);
  void (async () => {
    try {
      let alt = await postHikkaCatalog(catalogPayload, signal);
      if (isCancelled() || signal.aborted) return;
      if (!alt.success || !alt.hikkaSlug?.trim() || !(alt.episodes?.length ?? 0)) {
        await delayMs(1400, signal);
        if (isCancelled() || signal.aborted) return;
        alt = await postHikkaCatalog(catalogPayload, signal);
      }
      if (isCancelled() || signal.aborted) return;
      if (!alt.success || !alt.hikkaSlug?.trim()) return;
      if (!(alt.episodes?.length ?? 0)) return;
      const slug = alt.hikkaSlug.trim();
      writeVerifiedHikkaMapping(localAnimeId, slug);
      const episodes = alt.episodes ?? [];
      if (episodes.length > 0 && warmCatalogsRef) {
        upsertWarmHikkaCatalog(warmCatalogsRef, localAnimeId, slug, episodes);
      }
      onWarm?.(alt);
      onEligible();
    } catch {

    }
  })();
}

export function startAlternateProviderWarmup(
  dataForResolve: AnimeData,
  localAnimeId: string,
  signal: AbortSignal,
  isCancelled: () => boolean,
  onHikkaEligible: () => void,
  onLibertyEligible: () => void,
  onHikkaWarm: (catalog: HikkaCatalogBffOk) => void,
  onLibertyWarm: (catalog: AnilibertyCatalogBffOk) => void,
  warmCatalogsRef?: MutableRefObject<WarmAlternateCatalogEntry | null>
): void {
  prefetchAnilibertyMapping(
    dataForResolve,
    localAnimeId,
    signal,
    isCancelled,
    onLibertyEligible,
    onLibertyWarm,
    warmCatalogsRef
  );
  prefetchHikkaMapping(
    dataForResolve,
    localAnimeId,
    signal,
    isCancelled,
    onHikkaEligible,
    onHikkaWarm,
    warmCatalogsRef
  );
}

export function prefetchAnimepaheMapping(
  dataForResolve: AnimeData,
  localAnimeId: string,
  signal: AbortSignal,
  isCancelled: () => boolean,
  onMapped: (paheId: string) => void
): void {
  if (readVerifiedPaheMapping(localAnimeId)?.paheId) return;
  const catalogPayload = catalogBodyFromAnimeData(dataForResolve, localAnimeId);
  void (async () => {
    try {
      const alt = await postAnimepaheCatalog(catalogPayload, signal);
      if (isCancelled() || signal.aborted) return;
      if (!alt.success || !alt.paheId?.trim()) return;
      writeVerifiedPaheMapping(localAnimeId, alt.paheId.trim(), alt.hasSeriesDub === true);
      onMapped(alt.paheId.trim());
    } catch {

    }
  })();
}
