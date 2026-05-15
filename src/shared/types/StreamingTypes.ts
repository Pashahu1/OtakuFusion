import type { VideoTrack } from "./VideoTrackTypes";

export interface StreamingData {
  streamingLink: StreamingType[];
  servers: StreamServer[];
  /** Опційні інтервали (секунди), напр. з Aniliberty / Crysoline `sources`. */
  skipSegments?: {
    intro: { start: number; end: number } | null;
    outro: { start: number; end: number } | null;
  };
}

export type StreamingType = {
  id: number;
  type: "dub" | "sub";
  link: {
    file: string;
    type: string;
  };
  tracks: VideoTrack[];
  server: string;
  iframe?: string;
  request_headers?: Record<string, string>;
};

export type StreamServer = {
  type: string;
  data_id: number;
  server_id: number;
  server_name: string;
};
