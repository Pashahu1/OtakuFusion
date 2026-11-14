import type { WatchProbeConfig } from '@/lib/watchResolveProbe';

export type WatchLang = 'sub' | 'dub';

export type WatchResolveStreamProvider = 'hikka';

export interface WatchResolveOutcome {
  status: number;
  body: Record<string, unknown>;
}

export interface HikkaResolveParams {
  startedAt: number;
  episode: number;
  origin: string;
  hikkaSlug: string;
  epTokenOverride?: string | null;
  titleTerms?: string[];
}

