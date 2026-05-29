import type { WatchProbeConfig } from '@/lib/watchResolveProbe';

export type WatchLang = 'sub' | 'dub';

export type WatchResolveStreamProvider = 'animepahe' | 'aniliberty' | 'hikka';

export interface WatchResolveOutcome {
  status: number;
  body: Record<string, unknown>;
}

export interface AnimepaheResolveParams {
  startedAt: number;
  episode: number;
  lang: WatchLang;
  probeCfg: WatchProbeConfig;
  origin: string;
  seriesId: string;
  preferredHint: string | null;
  anilibertyReleaseId: string | null;
  anilistId: number | null;
  epTokenOverride?: string | null;
  episodeHasDub?: boolean | null;
}

export interface AnilibertyResolveParams {
  startedAt: number;
  episode: number;
  origin: string;
  seriesId: string;
  preferredHint: string | null;
  epTokenOverride?: string | null;
  expectedEpisodes?: number | null;
  anilistStillAiring?: boolean;
}

export interface HikkaResolveParams {
  startedAt: number;
  episode: number;
  origin: string;
  hikkaSlug: string;
  epTokenOverride?: string | null;
}

export interface WatchResolveRequestContext {
  startedAt: number;
  episode: number;
  lang: WatchLang;
  probeCfg: WatchProbeConfig;
  origin: string;
  seriesId: string;
  provider: WatchResolveStreamProvider;
  preferredHint: string | null;
  anilibertyReleaseId: string | null;
  anilistId: number | null;
  epTokenOverride: string | null;
  episodeHasDub: boolean | null;
  expectedEpisodes: number | null;
  anilistStillAiring: boolean;
}
