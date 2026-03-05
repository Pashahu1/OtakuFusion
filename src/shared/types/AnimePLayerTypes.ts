import type { Segment } from './VideoSegmentsTypes';
import type { VideoTrack } from './VideoTrackTypes';

export interface AnimePlayerType {
  headers: {
    Referer: string;
  };
  tracks: VideoTrack[];
  intro?: Segment;
  outro?: Segment;
  sources: Source[];
  anilistID: number;
  malID: number;
}

export type Source = {
  url: string;
  type: 'hls' | 'mp4' | string;
};
