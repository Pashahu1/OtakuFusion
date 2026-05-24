import { postAnicoreCatalog } from '@/features/watch/lib/anicore-catalog-bff';
import { postAnilibertyCatalog, type AnilibertyCatalogBffOk } from '@/features/watch/lib/aniliberty-catalog-bff';
import { postHikkaCatalog, type HikkaCatalogBffOk } from '@/features/watch/lib/hikka-catalog-bff';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import {
  catalogBodyFromAnimeData,
  isLibertyCatalogAcceptableForAnime,
} from './watchAnimeCatalogUtils';
import {
  clearVerifiedLibertyMapping,
  readVerifiedAnicoreMapping,
  writeVerifiedHikkaMapping,
  writeVerifiedLibertyMapping,
  writeVerifiedAnicoreMapping,
} from './watchAnimeMappingCache';

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
  onWarm?: (catalog: AnilibertyCatalogBffOk) => void
): void {
  const catalogPayload = catalogBodyFromAnimeData(dataForResolve, localAnimeId);
  void (async () => {
    try {
      let alt = await postAnilibertyCatalog(catalogPayload, signal);
      if (isCancelled() || signal.aborted) return;
      if (!alt.success || !alt.libertyId?.trim()) {
        await delayMs(1400, signal);
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
      writeVerifiedLibertyMapping(localAnimeId, alt.libertyId.trim());
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
  onWarm?: (catalog: HikkaCatalogBffOk) => void
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
      writeVerifiedHikkaMapping(localAnimeId, alt.hikkaSlug.trim());
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
  onLibertyWarm: (catalog: AnilibertyCatalogBffOk) => void
): void {
  prefetchAnilibertyMapping(
    dataForResolve,
    localAnimeId,
    signal,
    isCancelled,
    onLibertyEligible,
    onLibertyWarm
  );
  prefetchHikkaMapping(
    dataForResolve,
    localAnimeId,
    signal,
    isCancelled,
    onHikkaEligible,
    onHikkaWarm
  );
}

export function prefetchAnicoreMapping(
  dataForResolve: AnimeData,
  localAnimeId: string,
  signal: AbortSignal,
  isCancelled: () => boolean,
  onMapped: (anicoreId: string) => void
): void {
  if (readVerifiedAnicoreMapping(localAnimeId)?.anicoreId) return;
  const catalogPayload = catalogBodyFromAnimeData(dataForResolve, localAnimeId);
  void (async () => {
    try {
      const alt = await postAnicoreCatalog(catalogPayload, signal);
      if (isCancelled() || signal.aborted) return;
      if (!alt.success || !alt.anicoreId?.trim()) return;
      writeVerifiedAnicoreMapping(localAnimeId, alt.anicoreId.trim(), alt.hasSeriesDub === true);
      onMapped(alt.anicoreId.trim());
    } catch {

    }
  })();
}
