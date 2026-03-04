import { useState, useEffect } from 'react';
import getAnimeInfo from '@/services/getAnimeInfo.services';
import getEpisodes from '@/services/getEpisodes.services';
import getNextEpisodeSchedule from '@/services/getNextEpisodeSchedule.services';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { SeasonsTypes } from '@/shared/types/GlobalAnimeTypes';
import type { NextEpisodeScheduleResult } from '@/services/getNextEpisodeSchedule.services';

export interface UseWatchAnimeReturn {
  animeInfo: AnimeData | null;
  seasons: SeasonsTypes[] | null;
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

export function useWatchAnime(
  animeId: string,
  initialEpisodeId: string | undefined
): UseWatchAnimeReturn {
  const [animeInfo, setAnimeInfo] = useState<AnimeData | null>(null);
  const [seasons, setSeasons] = useState<SeasonsTypes[] | null>(null);
  const [episodes, setEpisodes] = useState<EpisodesTypes[] | null>(null);
  const [totalEpisodes, setTotalEpisodes] = useState<number | null>(null);
  const [episodeId, setEpisodeId] = useState<string | null>(null);
  const [animeInfoLoading, setAnimeInfoLoading] = useState(false);
  const [nextEpisodeSchedule, setNextEpisodeSchedule] =
    useState<NextEpisodeScheduleResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reset when anime changes
  useEffect(() => {
    setEpisodes(null);
    setEpisodeId(null);
    setAnimeInfo(null);
    setSeasons(null);
    setTotalEpisodes(null);
    setAnimeInfoLoading(true);
    setError(null);
    setNextEpisodeSchedule(null);
  }, [animeId]);

  // Fetch anime + episodes
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [animeData, episodesData] = await Promise.all([
          getAnimeInfo(animeId),
          getEpisodes(animeId),
        ]);
        setAnimeInfo(animeData?.data ?? null);
        setSeasons(animeData?.seasons ?? null);
        setEpisodes(episodesData?.episodes ?? null);
        setTotalEpisodes(episodesData?.totalEpisodes ?? null);
        const newEpisodeId =
          initialEpisodeId ??
          (episodesData?.episodes?.length
            ? episodesData.episodes[0].id.match(/ep=(\d+)/)?.[1] ?? null
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
  }, [animeId, initialEpisodeId]);

  // Fetch next episode schedule
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
    seasons,
    episodes,
    totalEpisodes,
    episodeId,
    setEpisodeId,
    animeInfoLoading,
    nextEpisodeSchedule,
    error,
  };
}
