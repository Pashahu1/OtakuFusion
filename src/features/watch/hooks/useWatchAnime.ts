import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { getAnimeInfo } from '@/services/getAnimeInfo';
import { postAnimepaheCatalog, type AnimepaheCatalogBffOk } from '@/lib/animepahe-catalog-bff';
import { postAnilibertyCatalog, type AnilibertyCatalogBffOk } from '@/lib/aniliberty-catalog-bff';
import { postHikkaCatalog, type HikkaCatalogBffOk } from '@/lib/hikka-catalog-bff';
import { getAnimePaheEpisodesFromBff } from '@/lib/animepahe-episodes-bff';
import { getAnilibertyEpisodesFromBff } from '@/lib/aniliberty-episodes-bff';
import { getNextEpisodeSchedule } from '@/services/getNextEpisodeSchedule';
import { alignKaiEpisodesToAnilistSeasonStart } from '@/lib/alignKaiEpisodesToAnilistSeason';
import { aggregateTvInfoStreamCounts } from '@/shared/utils/catalogStreamCounts';
import {
  episodeMatchesSelection,
  getEpisodeNumberFromId,
} from '@/shared/utils/episodeUtils';
import { applyAnilistEpisodeDisplayTitles } from '@/lib/mergeKaiEpisodesWithAnilistTitles';
import { patchEpisodesSeriesDub } from '@/services/animepahe/patchEpisodesSeriesDub';
import type { WatchStreamProvider } from '@/lib/watch-provider';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { NextEpisodeScheduleResult } from '@/shared/types/GlobalAnimeTypes';
import {
  isAnilibertyEpisodeCountAcceptable,
  isAnilistStillAiringFromStatus,
} from '@/services/aniliberty/anilibertyEpisodeMatch';

export interface UseWatchAnimeReturn {
  animeInfo: AnimeData | null;
  /** Id каталогу Animepahe (`pahe_id`) — для resolve на гілці animepahe. */
  animepaheCatalogProviderId: string | null;
  /** Id релізу Anilibria — для resolve на гілці aniliberty. */
  anilibertyCatalogProviderId: string | null;
  /**
   * Shorthand: id активного провайдера епізодів (той самий, що відповідає `watchStreamProvider`).
   */
  providerAnimeId: string | null;
  episodes: EpisodesTypes[] | null;
  totalEpisodes: number | null;
  episodeId: string | null;
  setEpisodeId: React.Dispatch<React.SetStateAction<string | null>>;
  animeInfoLoading: boolean;
  nextEpisodeSchedule: NextEpisodeScheduleResult | null;
  error: string | null;
  /** Пункт Anilibria в меню плеєра лише після підтвердженого пошуку (не порожній каталог). */
  anilibertyLanguageMenuEligible: boolean;
  /** Пункт «Українська» (Hikka Features) після успішного каталогу. */
  hikkaLanguageMenuEligible: boolean;
  hikkaCatalogProviderId: string | null;
  /** М’яка зміна Animepahe ↔ Anilibria — список епізодів не скидається. */
  providerCatalogPending: boolean;
  /** Після появи streamUrl — тихий prefetch іншого провайдера (не конкурує з resolve). */
  runDeferredOppositeProviderPrefetch: () => void;
}

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'An error occurred.';
}

function readExpectedEpisodeCountFromAnime(data: AnimeData): number | null {
  const et = data.animeInfo?.tvInfo?.episodeTotal?.trim();
  if (!et || !/^\d+$/.test(et)) return null;
  const n = parseInt(et, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function isLibertyCatalogAcceptableForAnime(
  data: AnimeData,
  actualEpisodeCount: number
): boolean {
  const stillAiring = isAnilistStillAiringFromStatus(data.animeInfo?.Status);
  return isAnilibertyEpisodeCountAcceptable(
    readExpectedEpisodeCountFromAnime(data),
    actualEpisodeCount,
    { isOngoing: stillAiring, allowPartialCatalog: stillAiring }
  );
}

function clearVerifiedLibertyMapping(localAnimeId: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(getMappingCacheKey(localAnimeId, 'aniliberty'));
  } catch {
    /* ignore */
  }
}

function getMappingCacheKey(localAnimeId: string, provider: WatchStreamProvider): string {
  if (provider === 'aniliberty') return `aniliberty:mapping:${localAnimeId}`;
  if (provider === 'hikka') return `hikka:mapping:${localAnimeId}`;
  return `animepahe:mapping:${localAnimeId}`;
}

interface VerifiedPaheMapping {
  paheId: string;
  hasSeriesDub?: boolean;
}

interface VerifiedLibertyMapping {
  libertyId: string;
}

interface VerifiedHikkaMapping {
  hikkaSlug: string;
}

function readVerifiedPaheMapping(localAnimeId: string): VerifiedPaheMapping | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(getMappingCacheKey(localAnimeId, 'animepahe'));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { paheId?: string; hasSeriesDub?: boolean };
    if (!parsed || typeof parsed.paheId !== 'string' || !parsed.paheId.trim()) return null;
    return {
      paheId: parsed.paheId.trim(),
      hasSeriesDub: parsed.hasSeriesDub === true ? true : undefined,
    };
  } catch {
    return null;
  }
}

function readVerifiedLibertyMapping(localAnimeId: string): VerifiedLibertyMapping | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(getMappingCacheKey(localAnimeId, 'aniliberty'));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { libertyId?: string };
    if (!parsed || typeof parsed.libertyId !== 'string' || !parsed.libertyId.trim()) return null;
    return { libertyId: parsed.libertyId.trim() };
  } catch {
    return null;
  }
}

function writeVerifiedPaheMapping(
  localAnimeId: string,
  paheId: string,
  hasSeriesDub?: boolean
): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: { paheId: string; hasSeriesDub?: boolean } = {
      paheId: paheId.trim(),
    };
    if (hasSeriesDub === true) payload.hasSeriesDub = true;
    localStorage.setItem(getMappingCacheKey(localAnimeId, 'animepahe'), JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

function writeVerifiedLibertyMapping(localAnimeId: string, libertyId: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      getMappingCacheKey(localAnimeId, 'aniliberty'),
      JSON.stringify({ libertyId: libertyId.trim() })
    );
  } catch {
    /* ignore */
  }
}

function readVerifiedHikkaMapping(localAnimeId: string): VerifiedHikkaMapping | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(getMappingCacheKey(localAnimeId, 'hikka'));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { hikkaSlug?: string };
    if (!parsed || typeof parsed.hikkaSlug !== 'string' || !parsed.hikkaSlug.trim()) return null;
    return { hikkaSlug: parsed.hikkaSlug.trim() };
  } catch {
    return null;
  }
}

function writeVerifiedHikkaMapping(localAnimeId: string, hikkaSlug: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      getMappingCacheKey(localAnimeId, 'hikka'),
      JSON.stringify({ hikkaSlug: hikkaSlug.trim() })
    );
  } catch {
    /* ignore */
  }
}

interface WarmAlternateCatalogEntry {
  animeId: string;
  hikka?: { slug: string; episodes: EpisodesTypes[] };
  liberty?: { libertyId: string; episodes: EpisodesTypes[] };
}

/** Префетч Anilibria mapping + меню Language ще до перемикання провайдера. */
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

function prefetchAnilibertyMapping(
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
      /* тихий префетч */
    }
  })();
}

function prefetchHikkaMapping(
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
      /* тихий префетч */
    }
  })();
}

/** Паралельний warmup Anilibria + Hikka під час першого Animepahe-завантаження. */
function startAlternateProviderWarmup(
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

function prefetchAnimepaheMapping(
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
      /* тихий префетч */
    }
  })();
}

function catalogBodyFromAnimeData(data: AnimeData, anilistKey: string) {
  return {
    anilistId: anilistKey,
    title: data.title,
    romaji_title: data.romaji_title,
    japanese_title: data.japanese_title,
    showType: data.showType,
    premiered: data.animeInfo?.Premiered,
    episodeTotal: data.animeInfo?.tvInfo?.episodeTotal,
    mal_id: data.mal_id ?? null,
    synonyms: data.animeInfo?.Synonyms,
    anilistStatus: data.animeInfo?.Status,
  };
}

export function useWatchAnime(
  animeId: string,
  initialEpisodeId: string | undefined,
  watchStreamProvider: WatchStreamProvider
): UseWatchAnimeReturn {
  const [animeInfo, setAnimeInfo] = useState<AnimeData | null>(null);
  const [episodes, setEpisodes] = useState<EpisodesTypes[] | null>(null);
  const [animepaheCatalogProviderId, setAnimepaheCatalogProviderId] = useState<string | null>(null);
  const [anilibertyCatalogProviderId, setAnilibertyCatalogProviderId] = useState<string | null>(
    null
  );
  const [totalEpisodes, setTotalEpisodes] = useState<number | null>(null);
  const [episodeId, setEpisodeId] = useState<string | null>(null);
  const [animeInfoLoading, setAnimeInfoLoading] = useState(false);
  const [nextEpisodeSchedule, setNextEpisodeSchedule] =
    useState<NextEpisodeScheduleResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [anilibertyLanguageMenuEligible, setAnilibertyLanguageMenuEligible] = useState(false);
  const [hikkaLanguageMenuEligible, setHikkaLanguageMenuEligible] = useState(false);
  const [hikkaCatalogProviderId, setHikkaCatalogProviderId] = useState<string | null>(null);
  const [providerCatalogPending, setProviderCatalogPending] = useState(false);
  const initialEpisodeRef = useRef(initialEpisodeId);
  initialEpisodeRef.current = initialEpisodeId;

  const deferredOppositePrefetchRef = useRef<{
    animeId: string;
    data: AnimeData;
    provider: WatchStreamProvider;
  } | null>(null);
  const oppositePrefetchDoneRef = useRef<string | null>(null);
  const oppositePrefetchAbortRef = useRef<AbortController | null>(null);
  const alternateWarmupAbortRef = useRef<AbortController | null>(null);
  const warmCatalogsRef = useRef<WarmAlternateCatalogEntry | null>(null);

  const [episodeRemapPass, setEpisodeRemapPass] = useState(0);

  useEffect(() => {
    setEpisodeRemapPass(0);
  }, [animeId]);

  /** Повне скидання лише при зміні тайтлу — не при перемиканні Animepahe ↔ Anilibria. */
  useLayoutEffect(() => {
    setEpisodes(null);
    setAnimepaheCatalogProviderId(null);
    setAnilibertyCatalogProviderId(null);
    setEpisodeId(null);
    setAnimeInfo(null);
    setTotalEpisodes(null);
    setAnimeInfoLoading(true);
    setError(null);
    setAnilibertyLanguageMenuEligible(false);
    setHikkaLanguageMenuEligible(false);
    setHikkaCatalogProviderId(null);
    setProviderCatalogPending(false);
    deferredOppositePrefetchRef.current = null;
    oppositePrefetchDoneRef.current = null;
    oppositePrefetchAbortRef.current?.abort();
    oppositePrefetchAbortRef.current = null;
    alternateWarmupAbortRef.current?.abort();
    alternateWarmupAbortRef.current = null;
    warmCatalogsRef.current = null;
  }, [animeId]);

  const runDeferredOppositeProviderPrefetch = useCallback(() => {
    const pending = deferredOppositePrefetchRef.current;
    if (!pending || pending.animeId !== animeId) return;
    if (oppositePrefetchDoneRef.current === animeId) return;
    oppositePrefetchDoneRef.current = animeId;

    oppositePrefetchAbortRef.current?.abort();
    const controller = new AbortController();
    oppositePrefetchAbortRef.current = controller;
    const { signal } = controller;
    const isCancelled = () => oppositePrefetchAbortRef.current !== controller;

    if (pending.provider === 'animepahe') {
      prefetchAnilibertyMapping(
        pending.data,
        animeId,
        signal,
        () => isCancelled() || signal.aborted,
        () => {
          if (!isCancelled() && !signal.aborted) {
            setAnilibertyLanguageMenuEligible(true);
          }
        }
      );
      prefetchHikkaMapping(
        pending.data,
        animeId,
        signal,
        () => isCancelled() || signal.aborted,
        () => {
          if (!isCancelled() && !signal.aborted) {
            setHikkaLanguageMenuEligible(true);
          }
        }
      );
      return;
    }

    if (pending.provider === 'hikka') {
      prefetchAnimepaheMapping(
        pending.data,
        animeId,
        signal,
        () => isCancelled() || signal.aborted,
        (paheId) => {
          if (!isCancelled() && !signal.aborted) {
            setAnimepaheCatalogProviderId(paheId);
          }
        }
      );
      return;
    }

    prefetchAnimepaheMapping(
      pending.data,
      animeId,
      signal,
      () => isCancelled() || signal.aborted,
      (paheId) => {
        if (!isCancelled() && !signal.aborted) {
          setAnimepaheCatalogProviderId(paheId);
        }
      }
    );
  }, [animeId]);

  const animeInfoRef = useRef(animeInfo);
  animeInfoRef.current = animeInfo;
  const episodeIdRef = useRef(episodeId);
  episodeIdRef.current = episodeId;

  /**
   * Останній успішно завантажений «знімок» для розрізнення:
   * повне завантаження (anime / remap) vs лише зміна `watchStreamProvider`.
   * Оновлюється лише після успіху — у dev Strict Mode повторний ефект не пропускає перший fetch.
   */
  const stableWatchLoad = useRef<{
    animeId: string;
    remap: number;
    provider: WatchStreamProvider;
  } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    let cancelled = false;

    const s = stableWatchLoad.current;
    const providerOnly =
      s !== null &&
      s.animeId === animeId &&
      s.remap === episodeRemapPass &&
      s.provider !== watchStreamProvider;

    const applyCatalogSuccess = (
      dataForResolve: AnimeData,
      list: EpisodesTypes[],
      providerId: string,
      opts: {
        forceFuzzy: boolean;
        freshPaheCatalog: AnimepaheCatalogBffOk | null;
        freshLibertyCatalog: AnilibertyCatalogBffOk | null;
        freshHikkaCatalog: HikkaCatalogBffOk | null;
        preserveEpisodeNum: string | null;
        settleLoading: { current: boolean };
      }
    ) => {
      const {
        forceFuzzy,
        freshPaheCatalog,
        freshLibertyCatalog,
        freshHikkaCatalog,
        preserveEpisodeNum,
        settleLoading,
      } = opts;

      if (watchStreamProvider === 'aniliberty') {
        if (freshLibertyCatalog) {
          writeVerifiedLibertyMapping(animeId, providerId);
        }
        setAnilibertyCatalogProviderId(providerId);
      } else if (watchStreamProvider === 'hikka') {
        if (freshHikkaCatalog) {
          writeVerifiedHikkaMapping(animeId, providerId);
        }
        setHikkaCatalogProviderId(providerId);
        setHikkaLanguageMenuEligible(true);
      } else {
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

          oppositePrefetchDoneRef.current = animeId;
          alternateWarmupAbortRef.current?.abort();
          const warmupCtrl = new AbortController();
          alternateWarmupAbortRef.current = warmupCtrl;
          const { signal: warmupSignal } = warmupCtrl;
          const isWarmupCancelled = () =>
            alternateWarmupAbortRef.current !== warmupCtrl || warmupSignal.aborted;

          startAlternateProviderWarmup(
            dataForResolve,
            animeId,
            warmupSignal,
            () => isWarmupCancelled() || warmupSignal.aborted,
            () => {
              if (!isWarmupCancelled()) setHikkaLanguageMenuEligible(true);
            },
            () => {
              if (!isWarmupCancelled()) setAnilibertyLanguageMenuEligible(true);
            },
            (catalog) => {
              if (isWarmupCancelled()) return;
              const slug = catalog.hikkaSlug.trim();
              const eps = catalog.episodes ?? [];
              if (!slug || !eps.length) return;
              const prev =
                warmCatalogsRef.current?.animeId === animeId
                  ? warmCatalogsRef.current
                  : null;
              warmCatalogsRef.current = {
                animeId,
                hikka: { slug, episodes: eps },
                liberty: prev?.liberty,
              };
              setHikkaCatalogProviderId(slug);
            },
            (catalog) => {
              if (isWarmupCancelled()) return;
              const libertyId = catalog.libertyId.trim();
              const eps = catalog.episodes ?? [];
              if (!libertyId || !eps.length) return;
              const prev =
                warmCatalogsRef.current?.animeId === animeId
                  ? warmCatalogsRef.current
                  : null;
              warmCatalogsRef.current = {
                animeId,
                liberty: { libertyId, episodes: eps },
                hikka: prev?.hikka,
              };
              setAnilibertyCatalogProviderId(libertyId);
            }
          );
        }
      }

      if (!forceFuzzy) {
        deferredOppositePrefetchRef.current = {
          animeId,
          data: dataForResolve,
          provider: watchStreamProvider,
        };
      }

      const mergedEpisodes = applyAnilistEpisodeDisplayTitles(
        alignKaiEpisodesToAnilistSeasonStart(list, dataForResolve.anilistEpisodeTitles),
        dataForResolve.anilistEpisodeTitles,
        dataForResolve.title,
        dataForResolve.romaji_title
      );

      setEpisodes(mergedEpisodes);
      setTotalEpisodes(mergedEpisodes.length > 0 ? mergedEpisodes.length : null);

      const seriesDubHint =
        watchStreamProvider === 'animepahe' &&
        (freshPaheCatalog?.hasSeriesDub === true ||
          readVerifiedPaheMapping(animeId)?.hasSeriesDub === true);
      // SUB/DUB у бейджах і меню Language — лише з каталогу Animepahe; Anilibria/Hikka не скидають dub.
      if (watchStreamProvider === 'animepahe') {
        const counts = aggregateTvInfoStreamCounts(mergedEpisodes, {
          provider: 'animepahe',
          seriesDubHint,
        });
        setAnimeInfo((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            animeInfo: {
              ...prev.animeInfo,
              tvInfo: {
                ...prev.animeInfo.tvInfo,
                has_sub: counts.has_sub,
                has_dub: counts.has_dub,
              },
            },
          };
        });
      }

      const fromInitial =
        initialEpisodeRef.current ??
        (mergedEpisodes.length
          ? (getEpisodeNumberFromId(mergedEpisodes[0].id) ??
            String(mergedEpisodes[0].episode_no))
          : null);

      const preservedOk =
        preserveEpisodeNum &&
        mergedEpisodes.some((ep) => episodeMatchesSelection(ep, preserveEpisodeNum));

      const newEpisodeId = preservedOk ? preserveEpisodeNum : (fromInitial ?? null);
      setEpisodeId(newEpisodeId);

      stableWatchLoad.current = {
        animeId,
        remap: episodeRemapPass,
        provider: watchStreamProvider,
      };

      if (!cancelled && settleLoading.current) setAnimeInfoLoading(false);

      if (
        !cancelled &&
        (watchStreamProvider === 'hikka' || watchStreamProvider === 'aniliberty')
      ) {
        setProviderCatalogPending(false);
      }
    };

    const runCatalogPipeline = async (params: {
      dataForResolve: AnimeData;
      forceFuzzy: boolean;
      preserveEpisodeNum: string | null;
      settleLoading: { current: boolean };
      /** Лише повне завантаження тайтлу — не для soft swap провайдера. */
      allowEmptyCatalogRemap: boolean;
    }) => {
      const {
        dataForResolve,
        forceFuzzy,
        preserveEpisodeNum,
        settleLoading,
        allowEmptyCatalogRemap,
      } = params;
      const catalogPayload = catalogBodyFromAnimeData(dataForResolve, animeId);

      if (!forceFuzzy) {
        const hidP = readVerifiedPaheMapping(animeId);
        const hidL = readVerifiedLibertyMapping(animeId);
        if (!cancelled && !signal.aborted) {
          if (hidP?.paheId) setAnimepaheCatalogProviderId(hidP.paheId.trim());
          if (hidL?.libertyId) setAnilibertyCatalogProviderId(hidL.libertyId.trim());
        }
      }

      let providerId: string | null = null;
      let list: EpisodesTypes[] = [];
      let freshPaheCatalog: AnimepaheCatalogBffOk | null = null;
      let freshLibertyCatalog: AnilibertyCatalogBffOk | null = null;
      let freshHikkaCatalog: HikkaCatalogBffOk | null = null;

      if (watchStreamProvider === 'hikka') {
        if (!forceFuzzy) {
          const cachedH = readVerifiedHikkaMapping(animeId);
          if (cachedH?.hikkaSlug) {
            try {
              const catalog = await postHikkaCatalog(catalogPayload, signal);
              if (
                !cancelled &&
                !signal.aborted &&
                catalog.success &&
                catalog.hikkaSlug.trim() === cachedH.hikkaSlug &&
                (catalog.episodes?.length ?? 0) > 0
              ) {
                providerId = cachedH.hikkaSlug;
                list = catalog.episodes ?? [];
              }
            } catch {
              providerId = null;
              list = [];
            }
          }
        }

        if (!providerId || !list.length) {
          const catalog = await postHikkaCatalog(catalogPayload, signal);
          if (cancelled || signal.aborted) return;
          if (!catalog.success) {
            throw new Error(catalog.error);
          }
          if (!catalog.hikkaSlug?.trim()) {
            throw new Error('hikka_catalog_bad_shape');
          }
          freshHikkaCatalog = catalog;
          providerId = catalog.hikkaSlug.trim();
          list = catalog.episodes ?? [];
        }
      } else if (watchStreamProvider === 'aniliberty') {
        if (!forceFuzzy) {
          const cachedL = readVerifiedLibertyMapping(animeId);
          if (cachedL?.libertyId) {
            try {
              const cachedEp = await getAnilibertyEpisodesFromBff(cachedL.libertyId, signal);
              const cachedCount =
                cachedEp.totalEpisodes ?? cachedEp.episodes?.length ?? 0;
              if (
                !cancelled &&
                !signal.aborted &&
                (cachedEp.episodes?.length ?? 0) > 0 &&
                isLibertyCatalogAcceptableForAnime(dataForResolve, cachedCount)
              ) {
                providerId = cachedL.libertyId.trim();
                list = cachedEp.episodes ?? [];
              } else if (!cancelled && !signal.aborted) {
                clearVerifiedLibertyMapping(animeId);
              }
            } catch {
              providerId = null;
              list = [];
            }
          }
        }

        if (!providerId || !list.length) {
          const catalog = await postAnilibertyCatalog(catalogPayload, signal);

          if (cancelled || signal.aborted) return;

          if (!catalog.success) {
            throw new Error(catalog.error);
          }

          if (!catalog.libertyId?.trim()) {
            throw new Error('aniliberty_catalog_bad_shape');
          }

          freshLibertyCatalog = catalog;
          providerId = catalog.libertyId.trim();
          list = catalog.episodes ?? [];
        }
      } else {
        if (!forceFuzzy) {
          const cached = readVerifiedPaheMapping(animeId);
          if (cached?.paheId) {
            try {
              const cachedEp = await getAnimePaheEpisodesFromBff(cached.paheId, signal);
              if (!cancelled && !signal.aborted && (cachedEp.episodes?.length ?? 0) > 0) {
                providerId = cached.paheId.trim();
                list = patchEpisodesSeriesDub(
                  cachedEp.episodes ?? [],
                  cached.hasSeriesDub === true
                );
              }
            } catch {
              providerId = null;
              list = [];
            }
          }
        }

        if (!providerId || !list.length) {
          const catalog = await postAnimepaheCatalog(catalogPayload, signal);

          if (cancelled || signal.aborted) return;

          if (!catalog.success) {
            throw new Error(catalog.error);
          }

          if (!catalog.paheId?.trim()) {
            throw new Error('animepahe_catalog_bad_shape');
          }

          freshPaheCatalog = catalog;
          providerId = catalog.paheId.trim();
          list = catalog.episodes ?? [];
        }
      }

      if (cancelled || signal.aborted) return;

      if (!list.length) {
        try {
          localStorage.removeItem(getMappingCacheKey(animeId, watchStreamProvider));
        } catch {
          /* ignore */
        }
        if (allowEmptyCatalogRemap && !forceFuzzy && episodeRemapPass === 0) {
          settleLoading.current = false;
          setEpisodeRemapPass((n) => n + 1);
          return;
        }
        setError(
              watchStreamProvider === 'aniliberty'
                ? 'Anilibria returned an empty episode list. Refresh the page or try again later.'
                : watchStreamProvider === 'hikka'
                  ? 'Ukrainian sources returned an empty episode list. Try another provider.'
                  : 'Animepahe returned an empty episode list. Refresh the page or try again later.'
            );
        setAnimepaheCatalogProviderId(null);
        setAnilibertyCatalogProviderId(null);
        setHikkaCatalogProviderId(null);
        setAnilibertyLanguageMenuEligible(false);
        setHikkaLanguageMenuEligible(false);
        setEpisodes([]);
        setTotalEpisodes(0);
        setEpisodeId(null);
        return;
      }

      if (cancelled || signal.aborted) return;

      if (watchStreamProvider === 'aniliberty') {
        const actualCount = list.length;
        if (!isLibertyCatalogAcceptableForAnime(dataForResolve, actualCount)) {
          clearVerifiedLibertyMapping(animeId);
          setAnilibertyLanguageMenuEligible(false);
          setAnilibertyCatalogProviderId(null);
          throw new Error('aniliberty_episode_count_mismatch');
        }
        setAnilibertyLanguageMenuEligible(true);
      }

      applyCatalogSuccess(dataForResolve, list, providerId, {
        forceFuzzy,
        freshPaheCatalog,
        freshLibertyCatalog,
        freshHikkaCatalog,
        preserveEpisodeNum,
        settleLoading,
      });
    };

    if (providerOnly) {
      const dataForResolve = animeInfoRef.current;
      if (!dataForResolve) {
        stableWatchLoad.current = null;
        return () => {
          cancelled = true;
          controller.abort();
        };
      }

      const settleLoading = { current: false };
      setProviderCatalogPending(true);
      setError(null);
      const preserveEpisodeNum = episodeIdRef.current;
      const warm = warmCatalogsRef.current;

      const applyWarmProviderSwap = (
        list: EpisodesTypes[],
        providerId: string,
        provider: 'hikka' | 'aniliberty'
      ): void => {
        if (provider === 'hikka') {
          setHikkaCatalogProviderId(providerId);
          setHikkaLanguageMenuEligible(true);
        } else {
          setAnilibertyCatalogProviderId(providerId);
          setAnilibertyLanguageMenuEligible(true);
        }
        applyCatalogSuccess(dataForResolve, list, providerId, {
          forceFuzzy: false,
          freshPaheCatalog: null,
          freshLibertyCatalog: null,
          freshHikkaCatalog: null,
          preserveEpisodeNum: preserveEpisodeNum ?? null,
          settleLoading,
        });
      };

      if (
        watchStreamProvider === 'hikka' &&
        warm?.animeId === animeId &&
        warm.hikka?.slug &&
        (warm.hikka.episodes?.length ?? 0) > 0
      ) {
        applyWarmProviderSwap(warm.hikka.episodes, warm.hikka.slug, 'hikka');
        return () => {
          cancelled = true;
          controller.abort();
        };
      }

      if (
        watchStreamProvider === 'aniliberty' &&
        warm?.animeId === animeId &&
        warm.liberty?.libertyId &&
        (warm.liberty.episodes?.length ?? 0) > 0
      ) {
        applyWarmProviderSwap(
          warm.liberty.episodes,
          warm.liberty.libertyId,
          'aniliberty'
        );
        return () => {
          cancelled = true;
          controller.abort();
        };
      }

      if (watchStreamProvider === 'hikka') {
        setHikkaCatalogProviderId(null);
      } else if (watchStreamProvider === 'aniliberty') {
        setAnilibertyCatalogProviderId(null);
      }

      void (async () => {
        try {
          await runCatalogPipeline({
            dataForResolve,
            forceFuzzy: false,
            preserveEpisodeNum: preserveEpisodeNum ?? null,
            settleLoading,
            allowEmptyCatalogRemap: false,
          });
        } catch (episodesError) {
          if (cancelled || signal.aborted) return;
          console.warn('[useWatchAnime] provider swap catalog:', episodesError);
          setError(getErrorMessage(episodesError));
          setEpisodes([]);
          setTotalEpisodes(0);
          setEpisodeId(null);
          setProviderCatalogPending(false);
        }
      })();

      return () => {
        cancelled = true;
        controller.abort();
        setProviderCatalogPending(false);
      };
    }

    setEpisodes(null);
    setAnimepaheCatalogProviderId(null);
    setAnilibertyCatalogProviderId(null);
    setHikkaCatalogProviderId(null);
    setEpisodeId(null);
    setAnimeInfo(null);
    setTotalEpisodes(null);
    setAnimeInfoLoading(true);
    setError(null);
    setAnilibertyLanguageMenuEligible(false);
    setHikkaLanguageMenuEligible(false);
    if (episodeRemapPass === 0) {
      setNextEpisodeSchedule(null);
    }

    const fetchInitial = async () => {
      const settleLoading = { current: true };
      try {
        let animeData: Awaited<ReturnType<typeof getAnimeInfo>>;
        if (episodeRemapPass === 0) {
          const [info, schedule] = await Promise.all([
            getAnimeInfo(animeId),
            getNextEpisodeSchedule(animeId).catch((scheduleErr) => {
              console.error('Error fetching next episode schedule:', scheduleErr);
              return null;
            }),
          ]);
          animeData = info;
          if (!cancelled) {
            setNextEpisodeSchedule(schedule);
          }
        } else {
          animeData = await getAnimeInfo(animeId);
        }
        if (cancelled) return;
        setAnimeInfo(animeData?.data ?? null);
        const dataForResolve = animeData?.data;
        if (!dataForResolve) {
          setError('No anime data available.');
          return;
        }

        try {
          const forceFuzzy = episodeRemapPass > 0;
          await runCatalogPipeline({
            dataForResolve,
            forceFuzzy,
            preserveEpisodeNum: null,
            settleLoading,
            allowEmptyCatalogRemap: true,
          });
        } catch (episodesError) {
          if (cancelled || signal.aborted) return;
          console.warn('[useWatchAnime] catalog:', episodesError);
          setError(getErrorMessage(episodesError));
          setAnimepaheCatalogProviderId(null);
          setAnilibertyCatalogProviderId(null);
          setAnilibertyLanguageMenuEligible(false);
          setHikkaLanguageMenuEligible(false);
          setHikkaCatalogProviderId(null);
          setEpisodes([]);
          setTotalEpisodes(0);
          setEpisodeId(null);
        }
      } catch (err) {
        if (cancelled || signal.aborted) return;
        console.error('Error fetching initial data:', err);
        setError(getErrorMessage(err));
      } finally {
        if (!cancelled && settleLoading.current) setAnimeInfoLoading(false);
      }
    };
    void fetchInitial();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [animeId, episodeRemapPass, watchStreamProvider]);

  useEffect(() => {
    if (!animeId.trim()) return;
    if (animeInfoLoading) return;
    if (!initialEpisodeId || !episodes?.length) return;
    const valid = episodes.some((ep) => episodeMatchesSelection(ep, initialEpisodeId));
    if (valid) setEpisodeId(initialEpisodeId);
  }, [animeId, initialEpisodeId, episodes, animeInfoLoading]);

  const providerAnimeId =
    watchStreamProvider === 'aniliberty'
      ? anilibertyCatalogProviderId
      : watchStreamProvider === 'hikka'
        ? hikkaCatalogProviderId
        : animepaheCatalogProviderId;

  return {
    animeInfo,
    animepaheCatalogProviderId,
    anilibertyCatalogProviderId,
    hikkaCatalogProviderId,
    providerAnimeId,
    episodes,
    totalEpisodes,
    episodeId,
    setEpisodeId,
    animeInfoLoading,
    nextEpisodeSchedule,
    error,
    anilibertyLanguageMenuEligible,
    hikkaLanguageMenuEligible,
    providerCatalogPending,
    runDeferredOppositeProviderPrefetch,
  };
}
