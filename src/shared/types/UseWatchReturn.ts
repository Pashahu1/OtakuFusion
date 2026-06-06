import type { Dispatch, SetStateAction } from 'react';
import type { EpisodesTypes } from './EpisodesListTypes';
import type { ServerInfo } from './GlobalAnimeTypes';
import type { StreamingData } from './StreamingTypes';
import type { SubtitleItem } from './PlayerTypes';
import type { NextEpisodeScheduleResult } from '@/shared/types/GlobalAnimeTypes';
import type { AnimeData } from './animeDetailsTypes';

import type { WatchStreamProvider } from '@/lib/watch-provider';

export interface UseWatchReturn {
  error: string | null;
  buffering: boolean;
  /** Caption under loader during auto-retry resolve (English). */
  streamLoadingMessage: string | null;
  streamInfo: StreamingData | null;
  animeInfo: AnimeData | null;
  episodes: EpisodesTypes[] | null;
  nextEpisodeSchedule: NextEpisodeScheduleResult | null;
  animeInfoLoading: boolean;
  /** Player not ready yet (anime/episodes/ep_token) — do not show error until loaded. */
  playerShellPending: boolean;
  totalEpisodes: number | null;
  servers: ServerInfo[] | null;
  streamUrl: string | null;
  subtitles: SubtitleItem[] | null;
  thumbnail: string | null;
  episodeId: string | null;
  setEpisodeId: Dispatch<SetStateAction<string | null>>;
  activeEpisodeNum: number | null;
  activeServerId: string | null;
  setActiveServerId: Dispatch<SetStateAction<string | null>>;
  watchStreamProvider: WatchStreamProvider;
  setWatchStreamProvider: (provider: WatchStreamProvider) => void;
  streamErrorCode: string | null;
  /** Anilibria menu item only after successful Anilibria catalog (empty search — hidden). */
  anilibertyLanguageMenuEligible: boolean;
  /** Ukrainian (Hikka Features) item in Language menu. */
  hikkaLanguageMenuEligible: boolean;
  anikotoLanguageMenuEligible: boolean;
  /**
   * Player overlay text on fatal stream error (English).
   * `null` — player not in fatal error state (still loading or URL present).
   */
  streamOverlayMessage: { title: string; subtitle: string } | null;
}
