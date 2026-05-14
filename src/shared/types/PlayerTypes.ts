import type { WatchStreamProvider } from '@/lib/watch-provider';
import type { AnimeData } from './animeDetailsTypes';
import type { EpisodesTypes } from './EpisodesListTypes';
import type { ServerInfo } from './GlobalAnimeTypes';
import type { StreamingData } from './StreamingTypes';

export interface SubtitleItem {
  file: string;
  label: string;
  default?: boolean;
}

export interface PlayerProps {
  streamUrl: string;
  subtitles: SubtitleItem[] | null;
  thumbnail: string | null;
  episodeId: string | null;
  episodes: EpisodesTypes[] | null;
  playNext: (episodeId: string) => void;
  onEpisodeWatched?: ((episodeId: string) => void) | null;
  animeInfo: AnimeData | null;
  episodeNum: number | null;
  streamInfo: StreamingData | null;
  servers: ServerInfo[] | null;
  activeServerId: string | null;
  setActiveServerId: (id: string | null) => void;
  watchStreamProvider: WatchStreamProvider;
  setWatchStreamProvider: (provider: WatchStreamProvider) => void;
  onPlaybackError?: () => void;
  /** Перший стабільний кадр / відтворення — щоб оболонка могла прибрати лоадер без бліку. */
  onPlaybackSurfaceReady?: () => void;
}

