import { useCallback, useMemo } from 'react';

import { isAnilistStillAiringFromStatus } from '@/lib/catalog/providers/aniliberty/anilibertyEpisodeMatch';
import {
  DEFAULT_WATCH_STREAM_PROVIDER,
  type WatchStreamProvider,
} from '@/features/watch/lib/watch-provider';
import { nextWatchStreamProvider } from '@/features/watch/lib/watch-provider-fallback';
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
    return {
      id: a.id,
      mal_id: a.mal_id ?? null,
      title: a.title,
    };
  }, [anime.animeInfo]);

  const episodeEpToken = useMemo(
    () => selectEpisodeEpToken(anime, watchStreamProvider),
    [anime, watchStreamProvider],
  );

  const anilistStillAiring = useMemo(
    () => isAnilistStillAiringFromStatus(anime.animeInfo?.animeInfo?.Status),
    [anime.animeInfo?.animeInfo?.Status],
  );

  const expectedEpisodesForResolve = useMemo((): number | undefined => {
    if (anilistStillAiring) return undefined;
    const et = anime.animeInfo?.animeInfo?.tvInfo?.episodeTotal?.trim();
    if (!et || !/^\d+$/.test(et)) return undefined;
    const n = parseInt(et, 10);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }, [anilistStillAiring, anime.animeInfo?.animeInfo?.tvInfo?.episodeTotal]);

  const onAutoRetryExhausted = useCallback(() => {
    const next = nextWatchStreamProvider(watchStreamProvider);
    if (next) {
      setWatchStreamProvider(next);
      return;
    }
    setWatchStreamProvider(DEFAULT_WATCH_STREAM_PROVIDER);
  }, [watchStreamProvider, setWatchStreamProvider]);

  return useMemo(
    () => ({
      animeId,
      episodeId: anime.episodeId,
      streamAnime: streamAnimeMeta,
      providerAnimeId: selectProviderAnimeId(anime, watchStreamProvider),
      episodeEpToken,
      episodeHasDub: episodeHasDubForResolve,
      expectedEpisodes: expectedEpisodesForResolve,
      anilistStillAiring,
      preferredLang: resolverLang,
      onPlaybackLangResolved,
      watchStreamProvider,
      streamLangRevision,
      episodeDubStateKey,
      providerCatalogPending: anime.providerCatalogPending,
      episodesSourceProvider: anime.episodesSourceProvider,
      onAutoRetryExhausted,
      anilibertyCatalogVerified:
        watchStreamProvider === 'aniliberty' &&
        Boolean(anime.anilibertyCatalogProviderId?.trim()) &&
        anime.episodesSourceProvider === 'aniliberty',
    }),
    [
      animeId,
      anime,
      streamAnimeMeta,
      watchStreamProvider,
      episodeEpToken,
      episodeHasDubForResolve,
      expectedEpisodesForResolve,
      anilistStillAiring,
      resolverLang,
      onPlaybackLangResolved,
      streamLangRevision,
      episodeDubStateKey,
      onAutoRetryExhausted,
    ],
  );
}
