import type { Segment } from "./VideoSegmentsTypes";
import type { VideoTrack } from "./VideoTrackTypes";

export interface StreamingData {
  streamingLink: StreamingType[];
  servers: StreamServer[];
}

export type StreamingType = {
  id: number;
  type: "dub" | "sub";
  link: {
    file: string;
    type: string;
  };
  tracks: VideoTrack[];
  intro: Segment;
  outro: Segment;
  server: string;
};

export type StreamServer = {
  type: string;
  data_id: number;
  server_id: number;
  server_name: string;
};
