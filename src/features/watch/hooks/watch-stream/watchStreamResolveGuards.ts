import type { Dispatch, SetStateAction } from 'react';
import type { SubtitleItem } from '@/shared/types/PlayerTypes';
import type { StreamingData } from '@/shared/types/StreamingTypes';
import type { WatchResolveOptions } from './useWatchStreamTypes';

export function buildWatchStreamGenerationKey(
  opts: WatchResolveOptions | undefined,
): string {
  if (!opts?.streamAnime || !opts.episodeId) return 'blocked';
  return [
    opts.animeId,
    opts.episodeId,
    opts.watchStreamProvider,
    String(opts.streamLangRevision),
    opts.preferredLang,
    opts.episodeDubStateKey,
    opts.providerAnimeId ?? '',
    opts.episodeEpToken ?? '',
  ].join('|');
}

export function isWatchResolveBlocked(opts: WatchResolveOptions | undefined): boolean {
  if (!opts?.streamAnime || !opts.episodeId) return true;
  const sp = opts.watchStreamProvider;
  const epSource = opts.episodesSourceProvider;

  if (epSource != null && epSource !== sp) return true;
  if (opts.providerCatalogPending === true) return true;

  const providerId = opts.providerAnimeId?.trim() ?? '';
  const needsProviderCatalog = sp === 'hikka' || sp === 'aniliberty' || sp === 'anikoto';
  if (needsProviderCatalog && !providerId) return true;
  return false;
}

export function resetWatchStreamState(setters: {
  setStreamInfo: Dispatch<SetStateAction<StreamingData | null>>;
  setStreamUrl: Dispatch<SetStateAction<string | null>>;
  setSubtitles: Dispatch<SetStateAction<SubtitleItem[]>>;
  setThumbnail: Dispatch<SetStateAction<string | null>>;
  setBuffering: Dispatch<SetStateAction<boolean>>;
  setStreamLoadingMessage: Dispatch<SetStateAction<string | null>>;
  setResolveAttempted: Dispatch<SetStateAction<boolean>>;
  setError: Dispatch<SetStateAction<string | null>>;
  setErrorCode: Dispatch<SetStateAction<string | null>>;
}): void {
  setters.setStreamInfo(null);
  setters.setStreamUrl(null);
  setters.setSubtitles([]);
  setters.setThumbnail(null);
  setters.setBuffering(true);
  setters.setStreamLoadingMessage(null);
  setters.setResolveAttempted(false);
  setters.setError(null);
  setters.setErrorCode(null);
}

export function primeWatchStreamResolve(setters: {
  setError: Dispatch<SetStateAction<string | null>>;
  setErrorCode: Dispatch<SetStateAction<string | null>>;
  setStreamLoadingMessage: Dispatch<SetStateAction<string | null>>;
  setResolveAttempted: Dispatch<SetStateAction<boolean>>;
  setBuffering: Dispatch<SetStateAction<boolean>>;
  setStreamInfo: Dispatch<SetStateAction<StreamingData | null>>;
  setStreamUrl: Dispatch<SetStateAction<string | null>>;
  setSubtitles: Dispatch<SetStateAction<SubtitleItem[]>>;
  setThumbnail: Dispatch<SetStateAction<string | null>>;
}): void {
  setters.setError(null);
  setters.setErrorCode(null);
  setters.setStreamLoadingMessage(null);
  setters.setResolveAttempted(false);
  setters.setBuffering(true);
  setters.setStreamInfo(null);
  setters.setStreamUrl(null);
  setters.setSubtitles([]);
  setters.setThumbnail(null);
}
