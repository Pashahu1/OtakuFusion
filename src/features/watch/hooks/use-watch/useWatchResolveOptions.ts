import { useCallback, useMemo } from 'react';

import {
  playbackAudioToStreamLang,
  type WatchPlaybackAudio,
} from '@/features/watch/lib/playback-audio';
import {
  DEFAULT_WATCH_STREAM_PROVIDER,
  type WatchStreamProvider,
} from '@/features/watch/lib/watch-provider';
import { nextWatchStreamProvider } from '@/features/watch/lib/watch-provider-fallback';
import { WATCH_SERVER_SUB_ID } from '@/shared/data/servers';
import type { WatchResolveOptions } from '../useWatchStream';

import {
  selectEpisodeEpToken,
  selectProviderAnimeId,
  type WatchAnimeCatalogSlice,
} from './watchCatalogSelectors';

interface UseWatchResolveOptionsInput {
  animeId: string;
  anime: WatchAnimeCatalogSlice;
  watchStreamProvider: WatchStreamProvider;
  playbackAudio: WatchPlaybackAudio;
  anikotoMatchPending: boolean;
  streamLangRevision: number;
  resolverLang: 'sub' | 'dub';
  episodeHasDubForResolve: boolean | undefined;
  episodeDubStateKey: string;
  onPlaybackLangResolved: (lang: 'sub' | 'dub') => void;
  setWatchStreamProvider: (next: WatchStreamProvider) => void;
  setActiveServerIdRaw: (id: string | null) => void;
}

export function useWatchResolveOptions({
  animeId,
  anime,
  watchStreamProvider,
  playbackAudio,
  anikotoMatchPending,
  streamLangRevision,
  resolverLang,
  episodeHasDubForResolve,
  episodeDubStateKey,
  onPlaybackLangResolved,
  setWatchStreamProvider,
  setActiveServerIdRaw,
}: UseWatchResolveOptionsInput): WatchResolveOptions {
  const streamAnimeMeta = useMemo(() => {
    const a = anime.animeInfo;
    if (!a) return null;
    const episodeTotal = Number(a.animeInfo?.tvInfo?.episodeTotal ?? '');
    return {
      id: a.id,
      mal_id: a.mal_id ?? null,
      title: a.title,
      romaji_title: a.romaji_title,
      japanese_title: a.japanese_title,
      synonyms: a.animeInfo?.Synonyms,
      showType: a.showType,
      episodeCount:
        Number.isFinite(episodeTotal) && episodeTotal > 0 ? Math.floor(episodeTotal) : null,
    };
  }, [anime.animeInfo]);

  const episodeEpToken = useMemo(
    () => selectEpisodeEpToken(anime, watchStreamProvider),
    [anime, watchStreamProvider],
  );

  const onAutoRetryExhausted = useCallback(() => {
    setActiveServerIdRaw(WATCH_SERVER_SUB_ID);

    const next = nextWatchStreamProvider(watchStreamProvider);
    if (next) {
      setWatchStreamProvider(next);
      return;
    }
    setWatchStreamProvider(DEFAULT_WATCH_STREAM_PROVIDER);
  }, [watchStreamProvider, setWatchStreamProvider, setActiveServerIdRaw]);

  return useMemo(
    () => ({
      animeId,
      episodeId: anime.episodeId,
      streamAnime: streamAnimeMeta,
      providerAnimeId: selectProviderAnimeId(anime, watchStreamProvider),
      episodeEpToken,
      episodeHasDub: episodeHasDubForResolve,
      preferredLang:
        playbackAudio === 'uk' ? resolverLang : playbackAudioToStreamLang(playbackAudio),
      playbackAudio,
      anikotoMatchPending,
      onPlaybackLangResolved,
      watchStreamProvider,
      streamLangRevision,
      episodeDubStateKey,
      providerCatalogPending: anime.providerCatalogPending,
      episodesSourceProvider: anime.episodesSourceProvider,
      onAutoRetryExhausted,
    }),
    [
      animeId,
      anime,
      streamAnimeMeta,
      watchStreamProvider,
      episodeEpToken,
      episodeHasDubForResolve,
      resolverLang,
      playbackAudio,
      anikotoMatchPending,
      onPlaybackLangResolved,
      streamLangRevision,
      episodeDubStateKey,
      onAutoRetryExhausted,
    ],
  );
}
