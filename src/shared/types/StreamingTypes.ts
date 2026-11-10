import type { VideoTrack } from "./VideoTrackTypes";

/** Quality variants when API returns separate HLS playlists per resolution. */
export interface StreamQualityVariant {
  height: number;
  label: string;
  url: string;
  request_headers?: Record<string, string>;
}

export interface StreamingData {
  streamingLink: StreamingType[];
  servers: StreamServer[];
  /** Optional intervals (seconds) from provider `sources`. */
  skipSegments?: {
    intro: { start: number; end: number } | null;
    outro: { start: number; end: number } | null;
  };
  /** Separate playlists per resolution from `watch/resolve` (`quality_variants`). */
  qualityVariants?: StreamQualityVariant[];
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
