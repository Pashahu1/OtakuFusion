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

export function parseExpectedEpisodesParam(sp: URLSearchParams): number | null {
  const raw = sp.get('expected_episodes')?.trim();
  if (!raw || !/^\d+$/.test(raw)) return null;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function parseAnilistId(sp: URLSearchParams): number | null {
  const anilistRaw = sp.get('anilist_id')?.trim();
  const anilistParsed = anilistRaw ? Number(anilistRaw) : NaN;
  return Number.isFinite(anilistParsed) && anilistParsed > 0
    ? Math.floor(anilistParsed)
    : null;
}

export function parseEpisodeHasDub(sp: URLSearchParams): boolean | null {
  const raw = sp.get('episode_has_dub')?.trim().toLowerCase();
  if (raw === '1' || raw === 'true') return true;
  if (raw === '0' || raw === 'false') return false;
  return null;
}

export function missingSeriesIdError(provider: WatchResolveStreamProvider): string {
  if (provider === 'aniliberty') {
    return 'ani_id is required (Aniliberty release id from catalog)';
  }
  if (provider === 'hikka') {
    return 'ani_id is required (Hikka slug from catalog)';
  }
  return 'ani_id is required (Animepahe series id from catalog)';
}
