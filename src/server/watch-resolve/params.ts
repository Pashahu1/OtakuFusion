import { normalizeWatchStreamProvider } from '@/features/watch/lib/watch-provider';
import type { WatchLang, WatchResolveStreamProvider } from '@/server/watch-resolve/types';

export function getNormalizedLang(sp: URLSearchParams): WatchLang {
  const raw = sp.get('lang') ?? sp.get('language');
  return raw?.trim().toLowerCase() === 'dub' ? 'dub' : 'sub';
}

export function getStreamProvider(sp: URLSearchParams): WatchResolveStreamProvider {
  return normalizeWatchStreamProvider(sp.get('stream_provider'));
}

export function parseEpisodeNumber(sp: URLSearchParams): number | null {
  const value = Number(sp.get('episode') ?? '');
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.floor(value);
}

export function missingSeriesIdError(provider: WatchResolveStreamProvider): string {
  if (provider === 'hikka') {
    return 'ani_id is required (Hikka slug from catalog)';
  }
  if (provider === 'anikoto') {
    return 'ani_id is required (Anikoto slug from catalog)';
  }
  return 'ani_id is required (provider series id from catalog)';
}
