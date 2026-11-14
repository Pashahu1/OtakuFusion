import type { PlayerProps } from '@/shared/types/PlayerTypes';

export interface UseArtplayerInstanceParams {
  localAnimeId: string;
  streamUrl: string;
  subtitles: PlayerProps['subtitles'];
  thumbnail: PlayerProps['thumbnail'];
  episodeId: PlayerProps['episodeId'];
  episodes: PlayerProps['episodes'];
  currentEpisodeIndex: number;
  playNext: PlayerProps['playNext'];
  onEpisodeWatched: PlayerProps['onEpisodeWatched'];
  animeInfo: PlayerProps['animeInfo'];
  episodeNum: PlayerProps['episodeNum'];
  streamInfo: PlayerProps['streamInfo'];
  servers: PlayerProps['servers'];
  activeServerId: PlayerProps['activeServerId'];
  setActiveServerId: PlayerProps['setActiveServerId'];
  watchStreamProvider: PlayerProps['watchStreamProvider'];
  setWatchStreamProvider: PlayerProps['setWatchStreamProvider'];
  playbackAudio: PlayerProps['playbackAudio'];
  setPlaybackAudio: PlayerProps['setPlaybackAudio'];
  anikotoJapaneseEligible: PlayerProps['anikotoJapaneseEligible'];
  anikotoEnglishEligible: PlayerProps['anikotoEnglishEligible'];
  onPlaybackError: PlayerProps['onPlaybackError'];
  onPlaybackSurfaceReady: PlayerProps['onPlaybackSurfaceReady'];
  hikkaLanguageMenuEligible: PlayerProps['hikkaLanguageMenuEligible'];
}
