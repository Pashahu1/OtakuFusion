import type { VideoTrack } from "./VideoTrackTypes";

/** Варіанти якості, коли API віддає окремі HLS на кожну роздільність (Animepahe / Anilibria). */
export interface StreamQualityVariant {
  height: number;
  label: string;
  url: string;
  request_headers?: Record<string, string>;
}

export interface StreamingData {
  streamingLink: StreamingType[];
  servers: StreamServer[];
  /** Опційні інтервали (секунди), напр. з Aniliberty / Crysoline `sources`. */
  skipSegments?: {
    intro: { start: number; end: number } | null;
    outro: { start: number; end: number } | null;
  };
  /** Окремі плейлисти за роздільністю з `watch/resolve` (`quality_variants`). */
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
