import {
  normalizeWatchPlaybackAudio,
  type WatchPlaybackAudio,
} from '@/features/watch/lib/playback-audio';
import { normalizeWatchStreamProvider } from '@/features/watch/lib/watch-provider';
import type { AnikotoMatchQuery } from '@/server/anikoto/matchCatalog';
import type { WatchLang, WatchResolveStreamProvider } from '@/server/watch-resolve/types';

export function getNormalizedLang(sp: URLSearchParams): WatchLang {
  const raw = sp.get('lang') ?? sp.get('language');
  return raw?.trim().toLowerCase() === 'dub' ? 'dub' : 'sub';
}

export function getPlaybackAudio(sp: URLSearchParams): WatchPlaybackAudio {
  return normalizeWatchPlaybackAudio(sp.get('playback_audio'));
}

export function readAnikotoMatchQuery(sp: URLSearchParams): AnikotoMatchQuery | null {
  const title = sp.get('keyword')?.trim() || sp.get('title')?.trim() || '';
  if (!title) return null;
  const episodes = Number(sp.get('episodes') ?? '');
  const romaji = sp.get('romaji_title')?.trim();
  const japanese = sp.get('japanese_title')?.trim();
  const synonyms = sp.get('synonyms')?.trim();
  const format = sp.get('format')?.trim();
  return {
    title,
    romaji_title: romaji || undefined,
    japanese_title: japanese || undefined,
    synonyms: synonyms || undefined,
    episodeCount: Number.isFinite(episodes) && episodes > 0 ? Math.floor(episodes) : null,
    format: format || null,
  };
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
  void provider;
  return 'ani_id is required (Hikka slug from catalog)';
}
