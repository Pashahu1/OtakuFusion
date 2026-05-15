import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { getAnimeInfo } from '@/services/getAnimeInfo';
import { postAnimepaheCatalog, type AnimepaheCatalogBffOk } from '@/lib/animepahe-catalog-bff';
import { postAnilibertyCatalog, type AnilibertyCatalogBffOk } from '@/lib/aniliberty-catalog-bff';
import { getAnimePaheEpisodesFromBff } from '@/lib/animepahe-episodes-bff';
import { getAnilibertyEpisodesFromBff } from '@/lib/aniliberty-episodes-bff';
import { getNextEpisodeSchedule } from '@/services/getNextEpisodeSchedule';
import { alignKaiEpisodesToAnilistSeasonStart } from '@/lib/alignKaiEpisodesToAnilistSeason';
import { aggregateCatalogStreamCounts } from '@/shared/utils/catalogStreamCounts';
import { getEpisodeNumberFromId } from '@/shared/utils/episodeUtils';
import { applyAnilistEpisodeDisplayTitles } from '@/lib/mergeKaiEpisodesWithAnilistTitles';
import { patchEpisodesSeriesDub } from '@/services/animepahe/patchEpisodesSeriesDub';
import type { WatchStreamProvider } from '@/lib/watch-provider';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { NextEpisodeScheduleResult } from '@/shared/types/GlobalAnimeTypes';

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
}

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'An error occurred.';
}

function getMappingCacheKey(localAnimeId: string, provider: WatchStreamProvider): string {
  return provider === 'aniliberty'
    ? `aniliberty:mapping:${localAnimeId}`
    : `animepahe:mapping:${localAnimeId}`;
}

interface VerifiedPaheMapping {
  paheId: string;
  hasSeriesDub?: boolean;
}

interface VerifiedLibertyMapping {
  libertyId: string;
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
  const initialEpisodeRef = useRef(initialEpisodeId);
  initialEpisodeRef.current = initialEpisodeId;

  const [episodeRemapPass, setEpisodeRemapPass] = useState(0);

  useEffect(() => {
    setEpisodeRemapPass(0);
  }, [animeId, watchStreamProvider]);

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
  }, [animeId, watchStreamProvider]);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    let cancelled = false;

    setEpisodes(null);
    setAnimepaheCatalogProviderId(null);
    setAnilibertyCatalogProviderId(null);
    setEpisodeId(null);
    setAnimeInfo(null);
    setTotalEpisodes(null);
    setAnimeInfoLoading(true);
    setError(null);
    setAnilibertyLanguageMenuEligible(false);
    if (episodeRemapPass === 0) {
      setNextEpisodeSchedule(null);
    }

    const fetchInitial = async () => {
      let settleLoading = true;
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
          setError('Немає даних аніме.');
          return;
        }

        try {
          const forceFuzzy = episodeRemapPass > 0;
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

          if (watchStreamProvider === 'aniliberty') {
            if (!forceFuzzy) {
              const cachedL = readVerifiedLibertyMapping(animeId);
              if (cachedL?.libertyId) {
                try {
                  const cachedEp = await getAnilibertyEpisodesFromBff(cachedL.libertyId, signal);
                  if (!cancelled && !signal.aborted && (cachedEp.episodes?.length ?? 0) > 0) {
                    providerId = cachedL.libertyId.trim();
                    list = cachedEp.episodes ?? [];
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
            if (!forceFuzzy && episodeRemapPass === 0) {
              settleLoading = false;
              setEpisodeRemapPass((n) => n + 1);
              return;
            }
            setError(
              watchStreamProvider === 'aniliberty'
                ? 'Aniliberty повернув порожній список епізодів. Оновіть сторінку або спробуйте пізніше.'
                : 'Animepahe повернув порожній список епізодів. Оновіть сторінку або спробуйте пізніше.'
            );
            setAnimepaheCatalogProviderId(null);
            setAnilibertyCatalogProviderId(null);
            setAnilibertyLanguageMenuEligible(false);
            setEpisodes([]);
            setTotalEpisodes(0);
            setEpisodeId(null);
            return;
          }

          if (watchStreamProvider === 'aniliberty') {
            if (freshLibertyCatalog) {
              writeVerifiedLibertyMapping(animeId, providerId);
            }
            setAnilibertyCatalogProviderId(providerId);
          } else {
            if (freshPaheCatalog) {
              writeVerifiedPaheMapping(animeId, providerId, freshPaheCatalog.hasSeriesDub === true);
            }
            setAnimepaheCatalogProviderId(providerId);
          }

          if (watchStreamProvider === 'aniliberty') {
            setAnilibertyLanguageMenuEligible(true);
          }

          if (!forceFuzzy) {
            void (async () => {
              try {
                if (cancelled || signal.aborted) return;
                if (watchStreamProvider === 'animepahe') {
                  if (readVerifiedLibertyMapping(animeId)?.libertyId) {
                    if (!cancelled) setAnilibertyLanguageMenuEligible(true);
                    return;
                  }
                  const alt = await postAnilibertyCatalog(catalogPayload, signal);
                  if (cancelled || signal.aborted) return;
                  if (!alt.success || !alt.libertyId?.trim()) {
                    if (!cancelled) {
                      if (!alt.success && alt.error === 'aniliberty_catalog_not_found') {
                        setAnilibertyCatalogProviderId(null);
                      }
                      setAnilibertyLanguageMenuEligible(false);
                    }
                    return;
                  }
                  writeVerifiedLibertyMapping(animeId, alt.libertyId.trim());
                  if (!cancelled) {
                    setAnilibertyCatalogProviderId(alt.libertyId.trim());
                    setAnilibertyLanguageMenuEligible(true);
                  }
                } else {
                  if (readVerifiedPaheMapping(animeId)?.paheId) return;
                  const alt = await postAnimepaheCatalog(catalogPayload, signal);
                  if (cancelled || signal.aborted) return;
                  if (!alt.success || !alt.paheId?.trim()) return;
                  writeVerifiedPaheMapping(animeId, alt.paheId.trim(), alt.hasSeriesDub === true);
                  if (!cancelled) setAnimepaheCatalogProviderId(alt.paheId.trim());
                }
              } catch {
                if (!cancelled) setAnilibertyLanguageMenuEligible(false);
              }
            })();
          }

          const mergedEpisodes = applyAnilistEpisodeDisplayTitles(
            alignKaiEpisodesToAnilistSeasonStart(
              list,
              dataForResolve.anilistEpisodeTitles
            ),
            dataForResolve.anilistEpisodeTitles,
            dataForResolve.title,
            dataForResolve.romaji_title
          );

          setEpisodes(mergedEpisodes);
          setTotalEpisodes(mergedEpisodes.length > 0 ? mergedEpisodes.length : null);

          const counts = aggregateCatalogStreamCounts(mergedEpisodes);
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
          const newEpisodeId =
            initialEpisodeRef.current ??
            (mergedEpisodes.length
              ? (getEpisodeNumberFromId(mergedEpisodes[0].id) ?? null)
              : null);
          setEpisodeId(newEpisodeId ?? null);
        } catch (episodesError) {
          if (cancelled || signal.aborted) return;
          console.warn('[useWatchAnime] catalog:', episodesError);
          setError(getErrorMessage(episodesError));
          setAnimepaheCatalogProviderId(null);
          setAnilibertyCatalogProviderId(null);
          setAnilibertyLanguageMenuEligible(false);
          setEpisodes([]);
          setTotalEpisodes(0);
          setEpisodeId(null);
        }
      } catch (err) {
        if (cancelled || signal.aborted) return;
        console.error('Error fetching initial data:', err);
        setError(getErrorMessage(err));
      } finally {
        if (!cancelled && settleLoading) setAnimeInfoLoading(false);
      }
    };
    fetchInitial();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [animeId, episodeRemapPass, watchStreamProvider]);

  useEffect(() => {
    if (!animeId.trim()) return;
    if (animeInfoLoading) return;
    if (!initialEpisodeId || !episodes?.length) return;
    const valid = episodes.some(
      (ep) => getEpisodeNumberFromId(ep.id) === initialEpisodeId
    );
    if (valid) setEpisodeId(initialEpisodeId);
  }, [animeId, initialEpisodeId, episodes, animeInfoLoading]);

  const providerAnimeId =
    watchStreamProvider === 'aniliberty'
      ? anilibertyCatalogProviderId
      : animepaheCatalogProviderId;

  return {
    animeInfo,
    animepaheCatalogProviderId,
    anilibertyCatalogProviderId,
    providerAnimeId,
    episodes,
    totalEpisodes,
    episodeId,
    setEpisodeId,
    animeInfoLoading,
    nextEpisodeSchedule,
    error,
    anilibertyLanguageMenuEligible,
  };
}
