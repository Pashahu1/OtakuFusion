import { useState, useEffect, useRef } from 'react';
import { getAnimeInfo } from '@/services/getAnimeInfo';
import { getEpisodes } from '@/services/getEpisodes';
import { getNextEpisodeSchedule } from '@/services/getNextEpisodeSchedule';
import { animekaiClient, type AnimeKaiResolvedMapping } from '@/lib/animekai-client';
import {
  buildAnimeKaiSearchTerms,
  buildAnimeKaiResolveHints,
  estimateAnimeKaiCatalogEpisodeCount,
  resolveAnimeKaiAniId,
} from '@/services/animekaiResolve';
import { getEpisodeNumberFromId } from '@/shared/utils/episodeUtils';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { NextEpisodeScheduleResult } from '@/shared/types/GlobalAnimeTypes';

export interface UseWatchAnimeReturn {
  animeInfo: AnimeData | null;
  /** AnimeKai ani_id (внутрішній), після резолву з AniList. */
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

interface ResolveTelemetryPayload {
  anime_id?: string;
  local_anime_id?: string;
  resolved_by?: 'cache' | 'anilist' | 'mal' | 'fuzzy';
  reason?: string;
  latency_ms?: number;
}

function trackResolveEvent(event: string, payload: ResolveTelemetryPayload): void {
  void event;
  void payload;
}

function getMappingCacheKey(localAnimeId: string): string {
  return `animekai:mapping:${localAnimeId}`;
}

/** Число епізодів з AniList у нас лежить в `tvInfo.sub` (mapAniListMediaToAnimeDetails → toTvInfo). */
function parseExpectedEpisodesFromAnimeData(data: AnimeData): number {
  const raw = data.animeInfo?.tvInfo?.sub?.trim();
  if (!raw) return 0;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

function maxEpisodeNumberFromList(list: EpisodesTypes[]): number {
  if (!list.length) return 0;
  return Math.max(...list.map((e) => e.episode_no));
}

/**
 * Кешований ani_id інколи вказує на «короткий» запис (наприклад лише dub-пакет), тоді як у AniList повний серіал.
 * Один раз скидаємо кеш і перезапускаємо резолв без localStorage.
 */
function shouldRemapStaleCacheByEpisodeCount(params: {
  expectedFromAnilist: number;
  providerEpisodes: EpisodesTypes[];
  providerTotalEpisodes: number;
}): boolean {
  const { expectedFromAnilist, providerEpisodes, providerTotalEpisodes } = params;
  if (expectedFromAnilist < 24) return false;
  const maxNo = maxEpisodeNumberFromList(providerEpisodes);
  const len = providerEpisodes.length;
  const best = Math.max(maxNo, len, providerTotalEpisodes);
  if (best <= 0) return false;
  const gap = expectedFromAnilist - best;
  return best < expectedFromAnilist * 0.45 && gap >= 50;
}

function readVerifiedMapping(localAnimeId: string): AnimeKaiResolvedMapping | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(getMappingCacheKey(localAnimeId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AnimeKaiResolvedMapping;
    if (!parsed || typeof parsed.ani_id !== 'string' || !parsed.ani_id.trim()) return null;
    if (parsed.status && parsed.status !== 'verified') return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeVerifiedMapping(localAnimeId: string, mapping: AnimeKaiResolvedMapping): void {
  if (typeof window === 'undefined') return;
  if (mapping.status && mapping.status !== 'verified') return;
  try {
    localStorage.setItem(
      getMappingCacheKey(localAnimeId),
      JSON.stringify({
        ani_id: mapping.ani_id,
        slug: mapping.slug,
        status: mapping.status ?? 'verified',
        confidence: mapping.confidence,
      })
    );
  } catch {
    /* ignore */
  }
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
  const healthcheckDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  initialEpisodeRef.current = initialEpisodeId;

  const [episodeRemapPass, setEpisodeRemapPass] = useState(0);

  useEffect(() => {
    setEpisodeRemapPass(0);
  }, [animeId]);

  useEffect(() => {
    let cancelled = false;

    setEpisodes(null);
    setProviderAnimeId(null);
    setEpisodeId(null);
    setAnimeInfo(null);
    setTotalEpisodes(null);
    setAnimeInfoLoading(true);
    setError(null);
    setNextEpisodeSchedule(null);

    const fetchInitial = async () => {
      let settleLoading = true;
      try {
        const animeData = await getAnimeInfo(animeId);
        if (cancelled) return;
        setAnimeInfo(animeData?.data ?? null);
        const dataForResolve = animeData?.data;
        if (!dataForResolve) {
          setError('Немає даних аніме.');
          return;
        }

        try {
          const resolveStartedAt = Date.now();
          trackResolveEvent('resolve_started', {
            anime_id: dataForResolve.id,
            local_anime_id: animeId,
          });
          const searchTerms = buildAnimeKaiSearchTerms(dataForResolve);
          const keyword = searchTerms[0];
          let resolvedBy: 'cache' | 'anilist' | 'mal' | 'fuzzy' = 'fuzzy';
          let resolved: { ani_id: string; slug: string } | null = null;
          const forceFuzzy = episodeRemapPass > 0;

          if (!forceFuzzy) {
            const cached = readVerifiedMapping(animeId);
            if (cached?.ani_id) {
              resolvedBy = 'cache';
              resolved = { ani_id: cached.ani_id, slug: cached.slug ?? cached.ani_id };
            }
          }

          if (!resolved && !forceFuzzy) {
            const byAnilist = await animekaiClient.resolveByAnilist(
              dataForResolve.id,
              animeId,
              keyword
            );
            if (byAnilist?.ani_id && (!byAnilist.status || byAnilist.status === 'verified')) {
              resolvedBy = 'anilist';
              resolved = { ani_id: byAnilist.ani_id, slug: byAnilist.slug ?? byAnilist.ani_id };
            }
          }

          if (
            !resolved &&
            !forceFuzzy &&
            dataForResolve.mal_id != null &&
            dataForResolve.mal_id > 0
          ) {
            const byMal = await animekaiClient.resolveByMal(
              dataForResolve.mal_id,
              animeId,
              keyword
            );
            if (byMal?.ani_id && (!byMal.status || byMal.status === 'verified')) {
              resolvedBy = 'mal';
              resolved = { ani_id: byMal.ani_id, slug: byMal.slug ?? byMal.ani_id };
            }
          }

          if (!resolved) {
            resolved = await resolveAnimeKaiAniId(
              searchTerms,
              undefined,
              buildAnimeKaiResolveHints(dataForResolve)
            );
            resolvedBy = 'fuzzy';
          }
          const { ani_id } = resolved;
          if (cancelled) return;
          trackResolveEvent('resolve_success', {
            anime_id: dataForResolve.id,
            local_anime_id: animeId,
            resolved_by: resolvedBy,
            latency_ms: Date.now() - resolveStartedAt,
          });

          const episodesData = await getEpisodes(ani_id);

          if (cancelled) return;

          let expectedEps = parseExpectedEpisodesFromAnimeData(dataForResolve);
          const catalogHint = await estimateAnimeKaiCatalogEpisodeCount(
            searchTerms,
            undefined,
            buildAnimeKaiResolveHints(dataForResolve)
          );
          if (typeof catalogHint === 'number' && catalogHint > expectedEps) {
            expectedEps = catalogHint;
          }
          const list = episodesData.episodes ?? [];
          const provTotal =
            typeof episodesData.totalEpisodes === 'number' && episodesData.totalEpisodes > 0
              ? episodesData.totalEpisodes
              : list.length;

          const truncatedVsAnilist =
            expectedEps > 0 &&
            shouldRemapStaleCacheByEpisodeCount({
              expectedFromAnilist: expectedEps,
              providerEpisodes: list,
              providerTotalEpisodes: provTotal,
            });

          if (truncatedVsAnilist && episodeRemapPass === 0) {
            settleLoading = false;
            try {
              localStorage.removeItem(getMappingCacheKey(animeId));
            } catch {
              /* ignore */
            }
            trackResolveEvent('resolve_episode_remapping', {
              anime_id: dataForResolve.id,
              local_anime_id: animeId,
              reason: `expected_${expectedEps}_provider_best_${Math.max(maxEpisodeNumberFromList(list), provTotal)}`,
            });
            setEpisodeRemapPass((n) => n + 1);
            return;
          }

          writeVerifiedMapping(animeId, {
            ani_id,
            slug: resolved.slug,
            status: 'verified',
          });
          setProviderAnimeId(ani_id);

          if (truncatedVsAnilist && episodeRemapPass >= 1) {
            trackResolveEvent('resolve_episode_mismatch_after_remap', {
              anime_id: dataForResolve.id,
              local_anime_id: animeId,
              reason: `anilist_${expectedEps}_provider_${Math.max(maxEpisodeNumberFromList(list), provTotal)}`,
            });
            if (healthcheckDebounceRef.current) clearTimeout(healthcheckDebounceRef.current);
            healthcheckDebounceRef.current = setTimeout(() => {
              void animekaiClient.healthcheckMapping({
                local_anime_id: animeId,
                anilist_id: dataForResolve.id,
                mal_id: dataForResolve.mal_id ?? undefined,
                ani_id,
                reason: 'episode_count_mismatch_anilist',
              });
            }, 600);
          }

          setEpisodes(episodesData.episodes ?? null);
          setTotalEpisodes(episodesData.totalEpisodes ?? null);
          const newEpisodeId =
            initialEpisodeRef.current ??
            (episodesData.episodes?.length
              ? (getEpisodeNumberFromId(episodesData.episodes[0].id) ?? null)
              : null);
          setEpisodeId(newEpisodeId ?? null);
        } catch (episodesError) {
          if (cancelled) return;
          console.warn('[useWatchAnime] AnimeKai episodes:', episodesError);
          setError(getErrorMessage(episodesError));
          setProviderAnimeId(null);
          setEpisodes([]);
          setTotalEpisodes(0);
          setEpisodeId(null);
          trackResolveEvent('resolve_failed', {
            anime_id: dataForResolve.id,
            local_anime_id: animeId,
            reason: getErrorMessage(episodesError),
          });
        }
      } catch (err) {
        if (cancelled) return;
        console.error('Error fetching initial data:', err);
        setError(getErrorMessage(err));
      } finally {
        if (!cancelled && settleLoading) setAnimeInfoLoading(false);
      }
    };
    fetchInitial();

    return () => {
      cancelled = true;
    };
  }, [animeId, episodeRemapPass]);

  useEffect(() => {
    if (!animeInfo || !providerAnimeId || !episodes?.length) return;
    if (typeof window === 'undefined') return;

    const hasDubNow = episodes.some((ep) => ep.hasDub === true);
    const currentEpisodeCount = episodes.length;

    const previousKey = `animekai:health:${animeId}`;
    let previous: { hasDub: boolean; episodeCount: number } | null = null;
    try {
      const raw = localStorage.getItem(previousKey);
      if (raw) previous = JSON.parse(raw) as { hasDub: boolean; episodeCount: number };
    } catch {
      previous = null;
    }

    const suspiciousLowCount = currentEpisodeCount <= 3;
    const suspiciousDubDrop = previous?.hasDub === true && !hasDubNow;
    if (suspiciousLowCount || suspiciousDubDrop) {
      if (healthcheckDebounceRef.current) {
        clearTimeout(healthcheckDebounceRef.current);
      }
      healthcheckDebounceRef.current = setTimeout(() => {
        void animekaiClient.healthcheckMapping({
          local_anime_id: animeId,
          anilist_id: animeInfo.id,
          mal_id: animeInfo.mal_id ?? undefined,
          ani_id: providerAnimeId,
          reason: suspiciousLowCount ? 'episodes_too_low' : 'dub_disappeared',
        });
      }, 1200);
    }

    try {
      localStorage.setItem(
        previousKey,
        JSON.stringify({ hasDub: hasDubNow, episodeCount: currentEpisodeCount })
      );
    } catch {
      /* ignore */
    }
  }, [animeId, animeInfo, providerAnimeId, episodes]);

  useEffect(() => {
    return () => {
      if (healthcheckDebounceRef.current) {
        clearTimeout(healthcheckDebounceRef.current);
      }
    };
  }, []);

  /** Не зіставляти `?ep=` зі списком, поки йде початкове завантаження — інакше після зміни `animeId` тут ще епізоди *попереднього* тайтлу і URL підтверджує чужий номер. */
  useEffect(() => {
    if (!animeId.trim()) return;
    if (animeInfoLoading) return;
    if (!initialEpisodeId || !episodes?.length) return;
    const valid = episodes.some(
      (ep) => getEpisodeNumberFromId(ep.id) === initialEpisodeId
    );
    if (valid) setEpisodeId(initialEpisodeId);
  }, [animeId, initialEpisodeId, episodes, animeInfoLoading]);

  useEffect(() => {
    let cancelled = false;
    const fetchSchedule = async () => {
      try {
        const data = await getNextEpisodeSchedule(animeId);
        if (!cancelled) setNextEpisodeSchedule(data);
      } catch (err) {
        if (!cancelled) {
          console.error('Error fetching next episode schedule:', err);
        }
      }
    };
    fetchSchedule();
    return () => {
      cancelled = true;
    };
  }, [animeId]);

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
