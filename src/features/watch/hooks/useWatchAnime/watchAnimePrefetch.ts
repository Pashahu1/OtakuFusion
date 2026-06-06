import { postAnilibertyCatalog, type AnilibertyCatalogBffOk } from '@/lib/bff/watch/aniliberty-catalog';
import { postAnikotoCatalog } from '@/lib/bff/watch/anikoto-catalog';
import { postHikkaCatalog, type HikkaCatalogBffOk } from '@/lib/bff/watch/hikka-catalog';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import {
  catalogBodyFromAnimeData,
  isLibertyCatalogAcceptableForAnime,
} from './watchAnimeCatalogUtils';
import type { MutableRefObject } from 'react';
import type { WarmAlternateCatalogEntry } from './types';
import {
  clearVerifiedLibertyMapping,
  readVerifiedAnikotoMapping,
  writeLibertyEpisodesCache,
  writeVerifiedAnikotoMapping,
  writeVerifiedHikkaMapping,
  writeVerifiedLibertyMapping,
} from '@/features/watch/lib/provider-mapping-cache';
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

export function prefetchAnikotoMapping(
  dataForResolve: AnimeData,
  localAnimeId: string,
  signal: AbortSignal,
  isCancelled: () => boolean,
  onEligible?: () => void,
): void {
  const cached = readVerifiedAnikotoMapping(localAnimeId);
  const catalogPayload = {
    ...catalogBodyFromAnimeData(dataForResolve, localAnimeId),
    ...(cached?.anikotoSlug ? { anikotoSlug: cached.anikotoSlug } : {}),
  };

  void (async () => {
    try {
      const catalog = await postAnikotoCatalog(catalogPayload, signal);
      if (isCancelled() || signal.aborted) return;
      if (!catalog.success || !catalog.anikotoSlug?.trim()) return;
      writeVerifiedAnikotoMapping(localAnimeId, catalog.anikotoSlug.trim());
      onEligible?.();
    } catch {
      // background prefetch — ignore
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
