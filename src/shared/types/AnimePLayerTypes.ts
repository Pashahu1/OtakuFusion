import type { VideoTrack } from './VideoTrackTypes';

export interface AnimePlayerType {
  headers: {
    Referer: string;
  };
  tracks: VideoTrack[];
  sources: Source[];
  anilistID: number;
  malID: number;
}

export type Source = {
  url: string;
  type: 'hls' | 'mp4' | string;
};
