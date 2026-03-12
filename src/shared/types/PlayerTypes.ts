import type { AnimeData } from './animeDetailsTypes';
import type { EpisodesTypes } from './EpisodesListTypes';
import type { ServerInfo } from './GlobalAnimeTypes';
import type { StreamingData } from './StreamingTypes';
import type { Segment } from './VideoSegmentsTypes';

export interface SubtitleItem {
  file: string;
  label: string;
  default?: boolean;
}

export interface PlayerProps {
  streamUrl: string;
  subtitles: SubtitleItem[] | null;
  thumbnail: string | null;
  intro: Segment | null;
  outro: Segment | null;
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
}

