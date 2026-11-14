import { postHikkaCatalog, type HikkaCatalogBffOk } from '@/lib/bff/watch/hikka-catalog';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import { catalogBodyFromAnimeData } from './watchAnimeCatalogUtils';
import type { MutableRefObject } from 'react';
import type { WarmAlternateCatalogEntry } from './types';
import { writeVerifiedHikkaMapping } from '@/features/watch/lib/provider-mapping-cache';
import { upsertWarmHikkaCatalog } from './watchAnimeWarmCatalog';

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

export function prefetchHikkaMapping(
  dataForResolve: AnimeData,
  localAnimeId: string,
  signal: AbortSignal,
  isCancelled: () => boolean,
  onEligible: () => void,
  onWarm?: (catalog: HikkaCatalogBffOk) => void,
  warmCatalogsRef?: MutableRefObject<WarmAlternateCatalogEntry | null>,
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
      /* background prefetch — ignore */
    }
  })();
}
