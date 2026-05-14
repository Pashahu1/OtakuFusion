import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { getAnimeInfo } from '@/services/getAnimeInfo';
import { postAnimepaheCatalog, type AnimepaheCatalogBffOk } from '@/lib/animepahe-catalog-bff';
import { getAnimePaheEpisodesFromBff } from '@/lib/animepahe-episodes-bff';
import { getNextEpisodeSchedule } from '@/services/getNextEpisodeSchedule';
import { alignKaiEpisodesToAnilistSeasonStart } from '@/lib/alignKaiEpisodesToAnilistSeason';
import { aggregateCatalogStreamCounts } from '@/shared/utils/catalogStreamCounts';
import { getEpisodeNumberFromId } from '@/shared/utils/episodeUtils';
import { mergeKaiEpisodesWithAnilistTitles } from '@/lib/mergeKaiEpisodesWithAnilistTitles';
import { patchEpisodesSeriesDub } from '@/services/animepahe/patchEpisodesSeriesDub';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { NextEpisodeScheduleResult } from '@/shared/types/GlobalAnimeTypes';

export interface UseWatchAnimeReturn {
  animeInfo: AnimeData | null;
  /** Ідентифікатор серії в каталозі Animepahe (Crysoline). */
  providerAnimeId: string | null;
  episodes: EpisodesTypes[] | null;
  totalEpisodes: number | null;
  episodeId: string | null;
  setEpisodeId: React.Dispatch<React.SetStateAction<string | null>>;
  animeInfoLoading: boolean;
  nextEpisodeSchedule: NextEpisodeScheduleResult | null;
  error: string | null;
}

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'An error occurred.';
}

function getMappingCacheKey(localAnimeId: string): string {
  return `animepahe:mapping:${localAnimeId}`;
}

interface VerifiedPaheMapping {
  paheId: string;
  hasSeriesDub?: boolean;
}

function readVerifiedMapping(localAnimeId: string): VerifiedPaheMapping | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(getMappingCacheKey(localAnimeId));
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

function writeVerifiedMapping(
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
    localStorage.setItem(getMappingCacheKey(localAnimeId), JSON.stringify(payload));
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
  initialEpisodeId: string | undefined
): UseWatchAnimeReturn {
  const [animeInfo, setAnimeInfo] = useState<AnimeData | null>(null);
  const [episodes, setEpisodes] = useState<EpisodesTypes[] | null>(null);
  const [providerAnimeId, setProviderAnimeId] = useState<string | null>(null);
  const [totalEpisodes, setTotalEpisodes] = useState<number | null>(null);
  const [episodeId, setEpisodeId] = useState<string | null>(null);
  const [animeInfoLoading, setAnimeInfoLoading] = useState(false);
  const [nextEpisodeSchedule, setNextEpisodeSchedule] =
    useState<NextEpisodeScheduleResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const initialEpisodeRef = useRef(initialEpisodeId);
  initialEpisodeRef.current = initialEpisodeId;

  const [episodeRemapPass, setEpisodeRemapPass] = useState(0);

  useEffect(() => {
    setEpisodeRemapPass(0);
  }, [animeId]);

  useLayoutEffect(() => {
    setEpisodes(null);
    setProviderAnimeId(null);
    setEpisodeId(null);
    setAnimeInfo(null);
    setTotalEpisodes(null);
    setAnimeInfoLoading(true);
    setError(null);
  }, [animeId]);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    let cancelled = false;

    setEpisodes(null);
    setProviderAnimeId(null);
    setEpisodeId(null);
    setAnimeInfo(null);
    setTotalEpisodes(null);
    setAnimeInfoLoading(true);
    setError(null);
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

          let paheId: string | null = null;
          let list: EpisodesTypes[] = [];
          let freshCatalog: AnimepaheCatalogBffOk | null = null;

          if (!forceFuzzy) {
            const cached = readVerifiedMapping(animeId);
            if (cached?.paheId) {
              try {
                const cachedEp = await getAnimePaheEpisodesFromBff(cached.paheId, signal);
                if (!cancelled && !signal.aborted && (cachedEp.episodes?.length ?? 0) > 0) {
                  paheId = cached.paheId.trim();
                  list = patchEpisodesSeriesDub(
                    cachedEp.episodes ?? [],
                    cached.hasSeriesDub === true
                  );
                }
              } catch {
                paheId = null;
                list = [];
              }
            }
          }

          if (!paheId || !list.length) {
            const catalog = await postAnimepaheCatalog(catalogPayload, signal);

            if (cancelled || signal.aborted) return;

            if (!catalog.success) {
              throw new Error(catalog.error);
            }

            if (!catalog.paheId?.trim()) {
              throw new Error('animepahe_catalog_bad_shape');
            }

            freshCatalog = catalog;
            paheId = catalog.paheId.trim();
            list = catalog.episodes ?? [];
          }

          if (cancelled || signal.aborted) return;

          if (!list.length) {
            try {
              localStorage.removeItem(getMappingCacheKey(animeId));
            } catch {
              /* ignore */
            }
            if (!forceFuzzy && episodeRemapPass === 0) {
              settleLoading = false;
              setEpisodeRemapPass((n) => n + 1);
              return;
            }
            setError(
              'Animepahe повернув порожній список епізодів. Оновіть сторінку або спробуйте пізніше.'
            );
            setProviderAnimeId(null);
            setEpisodes([]);
            setTotalEpisodes(0);
            setEpisodeId(null);
            return;
          }

          if (freshCatalog) {
            writeVerifiedMapping(animeId, paheId, freshCatalog.hasSeriesDub === true);
          }
          setProviderAnimeId(paheId);

          const mergedEpisodes = mergeKaiEpisodesWithAnilistTitles(
            alignKaiEpisodesToAnilistSeasonStart(
              list,
              dataForResolve.anilistEpisodeTitles
            ),
            dataForResolve.anilistEpisodeTitles
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
          console.warn('[useWatchAnime] Animepahe catalog:', episodesError);
          setError(getErrorMessage(episodesError));
          setProviderAnimeId(null);
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
  }, [animeId, episodeRemapPass]);

  useEffect(() => {
    if (!animeId.trim()) return;
    if (animeInfoLoading) return;
    if (!initialEpisodeId || !episodes?.length) return;
    const valid = episodes.some(
      (ep) => getEpisodeNumberFromId(ep.id) === initialEpisodeId
    );
    if (valid) setEpisodeId(initialEpisodeId);
  }, [animeId, initialEpisodeId, episodes, animeInfoLoading]);

  return {
    animeInfo,
    providerAnimeId,
    episodes,
    totalEpisodes,
    episodeId,
    setEpisodeId,
    animeInfoLoading,
    nextEpisodeSchedule,
    error,
  };
}
