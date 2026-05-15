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
  streamInfo: StreamingData | null;
  animeInfo: AnimeData | null;
  episodes: EpisodesTypes[] | null;
  nextEpisodeSchedule: NextEpisodeScheduleResult | null;
  animeInfoLoading: boolean;
  /** Плеєр ще не готовий (аніме/епізоди/ep_token) — не показувати «помилку» до завантаження. */
  playerShellPending: boolean;
  totalEpisodes: number | null;
  servers: ServerInfo[] | null;
  streamUrl: string | null;
  isFullOverview: boolean;
  setIsFullOverview: (isFullOverview: boolean) => void;
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
  /** Пункт Anilibria в меню плеєра лише після успішного каталогу Anilibria (порожній пошук — приховано). */
  anilibertyLanguageMenuEligible: boolean;
  /**
   * Текст оверлею плеєра при фатальній помилці стріму (англійською).
   * `null` — плеєр не в стані «фатальної помилки» (ще завантаження або є URL).
   */
  streamOverlayMessage: { title: string; subtitle: string } | null;
}
