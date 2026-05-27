import { getAnilibertyEpisodesFromBff } from '@/lib/aniliberty-episodes-bff';
import { alignEpisodesToAnilistSeasonStart } from '@/features/watch/lib/alignEpisodesToAnilistSeason';
import { applyAnilistEpisodeDisplayTitles } from '@/features/watch/lib/anilistEpisodeDisplayTitles';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { ApplyWatchCatalogSuccessContext } from './applyWatchCatalogSuccess';
import { applyWatchCatalogSuccess } from './applyWatchCatalogSuccess';
import {
  readLibertyEpisodesCache,
  writeLibertyEpisodesCache,
} from './anilibertyEpisodesCache';
import {
  clearVerifiedLibertyMapping,
  readVerifiedLibertyMapping,
} from './watchAnimeMappingCache';
import { isLibertyCatalogAcceptableForAnime } from './watchAnimeCatalogUtils';
import type { MutableRefObject } from 'react';
import type { WarmAlternateCatalogEntry } from './types';
import { upsertWarmLibertyCatalog } from './watchAnimeWarmCatalog';

export function trySyncAnilibertyProviderSwap(params: {
  animeId: string;
  dataForResolve: AnimeData;
  warm: WarmAlternateCatalogEntry | null;
  preserveEpisodeNum: string | null;
  applyCtx: ApplyWatchCatalogSuccessContext;
  warmCatalogsRef: MutableRefObject<WarmAlternateCatalogEntry | null>;
  setAnilibertyCatalogProviderId: (id: string) => void;
  setAnilibertyLanguageMenuEligible: (v: boolean) => void;
}): boolean {
  const {
    animeId,
    dataForResolve,
    warm,
    preserveEpisodeNum,
    applyCtx,
    warmCatalogsRef,
    setAnilibertyCatalogProviderId,
    setAnilibertyLanguageMenuEligible,
  } = params;

  const applySwap = (libertyId: string, rawEpisodes: EpisodesTypes[]) => {
    const merged = applyAnilistEpisodeDisplayTitles(
      alignEpisodesToAnilistSeasonStart(
        rawEpisodes,
        dataForResolve.anilistEpisodeTitles
      ),
      dataForResolve.anilistEpisodeTitles,
      dataForResolve.title,
      dataForResolve.romaji_title
    );
    if (!merged.length) return false;
    setAnilibertyCatalogProviderId(libertyId);
    setAnilibertyLanguageMenuEligible(true);
    upsertWarmLibertyCatalog(warmCatalogsRef, animeId, libertyId, merged);
    writeLibertyEpisodesCache(animeId, libertyId, merged, merged.length);
    applyWatchCatalogSuccess(applyCtx, dataForResolve, merged, libertyId, {
      forceFuzzy: false,
      freshPaheCatalog: null,
      freshLibertyCatalog: null,
      freshHikkaCatalog: null,
      preserveEpisodeNum,
      settleLoading: { current: false },
    });
    return true;
  };

  if (
    warm?.animeId === animeId &&
    warm.liberty?.libertyId &&
    (warm.liberty.episodes?.length ?? 0) > 0
  ) {
    return applySwap(warm.liberty.libertyId, warm.liberty.episodes);
  }

  const cached = readVerifiedLibertyMapping(animeId);
  if (!cached?.libertyId) return false;

  const libertyId = cached.libertyId.trim();
  const fromLs = readLibertyEpisodesCache(animeId, libertyId);
  if (!fromLs) return false;
  if (!isLibertyCatalogAcceptableForAnime(dataForResolve, fromLs.totalEpisodes)) {
    clearVerifiedLibertyMapping(animeId);
    return false;
  }

  return applySwap(libertyId, fromLs.episodes);
}

export async function fetchAnilibertyEpisodesForProviderSwap(params: {
  animeId: string;
  libertyId: string;
  dataForResolve: AnimeData;
  signal: AbortSignal;
  isAborted: () => boolean;
}): Promise<EpisodesTypes[] | null> {
  const { animeId, libertyId, dataForResolve, signal, isAborted } = params;
  try {
    const fetched = await getAnilibertyEpisodesFromBff(libertyId, signal);
    if (isAborted()) return null;
    const list = fetched.episodes ?? [];
    const count = fetched.totalEpisodes ?? list.length;
    if (
      !list.length ||
      !isLibertyCatalogAcceptableForAnime(dataForResolve, count)
    ) {
      clearVerifiedLibertyMapping(animeId);
      return null;
    }
    return list;
  } catch {
    return null;
  }
}
