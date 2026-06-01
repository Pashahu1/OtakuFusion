export type WatchProbeRequestLang = 'sub' | 'dub';

export interface WatchProbeConfig {
  masterMs: number;
  variantMs: number;
  skipVariant: boolean;
}

export interface HlsProxyProbeResult {
  ok: boolean;
  masterPlaylistText: string | null;
}
