import { useState, useEffect } from 'react';
import { getAnimeInfo } from '@/services/getAnimeInfo';
import { getEpisodes } from '@/services/getEpisodes';
import { getNextEpisodeSchedule } from '@/services/getNextEpisodeSchedule';
import { getEpisodeNumberFromId } from '@/shared/utils/episodeUtils';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { NextEpisodeScheduleResult } from '@/shared/types/GlobalAnimeTypes';

export interface UseWatchAnimeReturn {
  animeInfo: AnimeData | null;
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

function toPositiveInteger(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return Math.floor(value);
  }
  if (typeof value === 'string') {
    const parsed = Number(value.trim());
    if (Number.isFinite(parsed) && parsed > 0) return Math.floor(parsed);
  }
  return null;
}

function createFallbackEpisodes(
  animeData: AnimeData | null,
  initialEpisodeId: string | undefined
): EpisodesTypes[] {
  const fromTvInfo = toPositiveInteger(animeData?.animeInfo?.tvInfo?.sub);
  const fromInitial = toPositiveInteger(initialEpisodeId);
  const count = fromTvInfo ?? fromInitial ?? 1;
  const safeCount = Math.min(Math.max(count, 1), 500);
  return Array.from({ length: safeCount }, (_, index) => {
    const episodeNumber = index + 1;
    return {
      episode_no: episodeNumber,
      id: `?ep=${episodeNumber}`,
      data_id: episodeNumber,
      jname: `Episode ${episodeNumber}`,
      title: `Episode ${episodeNumber}`,
      japanese_title: `Episode ${episodeNumber}`,
      filler: false,
    };
  });
}

async function getEpisodesWithFallbackIds(
  ids: string[]
): Promise<{ providerId: string; episodesData: Awaited<ReturnType<typeof getEpisodes>> }> {
  let lastError: unknown;

  for (const id of ids) {
    try {
      const episodesData = await getEpisodes(id);
      if (episodesData?.episodes?.length) {
        return { providerId: id, episodesData };
      }
      // Accept empty list as a valid API response too.
      return { providerId: id, episodesData };
    } catch (error) {
      lastError = error;
      if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.warn('[useWatchAnime] episodes fetch failed for id:', id, error);
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Failed to fetch episodes');
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

  useEffect(() => {
    setEpisodes(null);
    setProviderAnimeId(null);
    setEpisodeId(null);
    setAnimeInfo(null);
    setTotalEpisodes(null);
    setAnimeInfoLoading(true);
    setError(null);
    setNextEpisodeSchedule(null);
  }, [animeId]);

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const animeData = await getAnimeInfo(animeId);
        setAnimeInfo(animeData?.data ?? null);
        const malId = animeData?.data?.mal_id;
        const candidateIds = [
          animeId,
          ...(malId ? [String(malId)] : []),
        ].filter((id, index, arr) => Boolean(id) && arr.indexOf(id) === index);
        let providerId = animeId;
        let episodesData: Awaited<ReturnType<typeof getEpisodes>> | null = null;

        try {
          const out = await getEpisodesWithFallbackIds(candidateIds);
          providerId = out.providerId;
          episodesData = out.episodesData;
        } catch (episodesError) {
          console.warn(
            '[useWatchAnime] fallback to synthetic episodes list:',
            episodesError
          );
          const fallbackEpisodes = createFallbackEpisodes(
            animeData?.data ?? null,
            initialEpisodeId
          );
          episodesData = {
            episodes: fallbackEpisodes,
            totalEpisodes: fallbackEpisodes.length,
          };
        }

        setProviderAnimeId(providerId);
        setEpisodes(episodesData?.episodes ?? null);
        setTotalEpisodes(episodesData?.totalEpisodes ?? null);
        const newEpisodeId =
          initialEpisodeId ??
          (episodesData?.episodes?.length
            ? (getEpisodeNumberFromId(episodesData.episodes[0].id) ?? null)
            : null);
        setEpisodeId(newEpisodeId ?? null);
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError(getErrorMessage(err));
      } finally {
        setAnimeInfoLoading(false);
      }
    };
    fetchInitial();
  }, [animeId]);

  useEffect(() => {
    if (!initialEpisodeId || !episodes?.length) return;
    const valid = episodes.some(
      (ep) => getEpisodeNumberFromId(ep.id) === initialEpisodeId
    );
    if (valid) setEpisodeId(initialEpisodeId);
  }, [initialEpisodeId, episodes]);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const data = await getNextEpisodeSchedule(animeId);
        setNextEpisodeSchedule(data);
      } catch (err) {
        console.error('Error fetching next episode schedule:', err);
      }
    };
    fetchSchedule();
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
