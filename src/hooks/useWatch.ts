import { useState, useMemo } from 'react';
import type { UseWatchReturn } from '@/shared/types/UseWatchReturn';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import { useWatchAnime } from './useWatchAnime';
import { useWatchServers } from './useWatchServers';
import { useWatchStream } from './useWatchStream';

export default function useWatch(
  animeId: string,
  initialEpisodeId: string | undefined
): UseWatchReturn {
  const [isFullOverview, setIsFullOverview] = useState(false);

  const anime = useWatchAnime(animeId, initialEpisodeId);
  const servers = useWatchServers(animeId, anime.episodeId);
  const stream = useWatchStream(
    animeId,
    anime.episodeId,
    servers.activeServerId,
    servers.servers
  );

  const activeEpisodeNum = useMemo((): number | null => {
    const { episodes, episodeId } = anime;
    if (!episodes?.length || !episodeId) return null;
    const ep = episodes.find((e: EpisodesTypes) => {
      const m = e.id.match(/ep=(\d+)/);
      return m && m[1] === episodeId;
    });
    return ep?.episode_no ?? null;
  }, [anime.episodes, anime.episodeId]);

  const error =
    anime.error ?? servers.error ?? stream.error ?? null;

  return {
    error,
    buffering: stream.buffering,
    serverLoading: servers.serverLoading,
    streamInfo: stream.streamInfo,
    animeInfo: anime.animeInfo,
    episodes: anime.episodes,
    nextEpisodeSchedule: anime.nextEpisodeSchedule,
    animeInfoLoading: anime.animeInfoLoading,
    totalEpisodes: anime.totalEpisodes,
    seasons: anime.seasons,
    servers: servers.servers,
    streamUrl: stream.streamUrl,
    isFullOverview,
    setIsFullOverview,
    subtitles: stream.subtitles.length ? stream.subtitles : null,
    thumbnail: stream.thumbnail,
    intro: stream.intro,
    outro: stream.outro,
    episodeId: anime.episodeId,
    setEpisodeId: anime.setEpisodeId,
    activeEpisodeNum,
    setActiveEpisodeNum: () => {},
    activeServerId: servers.activeServerId,
    setActiveServerId: servers.setActiveServerId,
  };
}
