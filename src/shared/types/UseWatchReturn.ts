import type { Dispatch, SetStateAction } from "react";
import type { EpisodesTypes } from "./EpisodesListTypes";
import type { AnimeInfo, SeasonsTypes, ServerInfo } from "./GlobalAnimeTypes";
import type { StreamingData } from "./StreamingTypes";
import type { Segment } from "./VideoSegmentsTypes";
import type { NextEpisodeScheduleResult } from "@/services/getNextEpisodeSchedule.services";

export interface UseWatchReturn {
    error: string | null;
    buffering: boolean;
    serverLoading: boolean;
    streamInfo: StreamingData | null;
    animeInfo: AnimeInfo | null;
    episodes: EpisodesTypes[] | null;
    nextEpisodeSchedule: NextEpisodeScheduleResult | null;
    animeInfoLoading: boolean;
    totalEpisodes: number | null;
    seasons: SeasonsTypes[] | null;
    servers: ServerInfo[] | null;
    streamUrl: string | null;
    isFullOverview: boolean;
    setIsFullOverview: (isFullOverview: boolean) => void;
    subtitles: Array<{ file: string; label: string }> | null;
    thumbnail: string | null;
    intro: Segment | null;
    outro: Segment | null;
    episodeId: string | null;
    setEpisodeId: Dispatch<SetStateAction<string | null>>;
    activeEpisodeNum: number | null;
    setActiveEpisodeNum: Dispatch<SetStateAction<number | null>>;
    activeServerId: string | null;
    setActiveServerId: Dispatch<SetStateAction<string | null>>;
  }