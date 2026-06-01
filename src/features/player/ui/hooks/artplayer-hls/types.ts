import type Artplayer from 'artplayer';
import type Hls from 'hls.js';

export interface ArtplayerHlsRuntimeContext {
  effectActive: () => boolean;
  suppressPlaybackError: () => boolean;
  onPlaybackError: () => void;
  useManualStreamQuality: boolean;
}

export interface ArtplayerHlsRuntime {
  onM3u8HlsInstance: (hls: InstanceType<typeof Hls>, art: Artplayer) => void;
  onM3u8HlsBeforeLoad: (hls: InstanceType<typeof Hls>) => void;
  bootHlsPlayback: (art: Artplayer, fullURL: string) => void;
  attachQualityPersistenceOnReady: (art: Artplayer) => void;
  reportFatalPlaybackError: (art: Artplayer) => void;
}
