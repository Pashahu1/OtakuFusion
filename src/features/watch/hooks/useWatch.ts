import {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
  type SetStateAction,
} from 'react';
import type { WatchStreamProvider } from '@/lib/watch-provider';
import { writeWatchStreamProvider } from '@/lib/watch-provider';
import { getEpisodeNumberFromId } from '@/shared/utils/episodeUtils';
import type { UseWatchReturn } from '@/shared/types/UseWatchReturn';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { ServerInfo } from '@/shared/types/GlobalAnimeTypes';
import { STORAGE_SERVER_TYPE } from '@/shared/data/servers';
import { useWatchAnime } from './useWatchAnime';
import { useWatchStream, type WatchStreamAnimeMeta } from './useWatchStream';

/**
 * English у меню + `lang=dub` для епізодів без `hasDub: true` у каталозі — узгоджено з Miruno gap-fill на `/api/watch/resolve`.
 * За замовчуванням увімкнено. Вимкнути (старий суворий режим): `NEXT_PUBLIC_MIRUNO_DUB_FALLBACK=0` або `false` / `off`.
 */
function isAnimepaheMirunoDubGapUiEnabled(): boolean {
  if (typeof process === 'undefined') return true;
  const raw = process.env.NEXT_PUBLIC_MIRUNO_DUB_FALLBACK?.trim().toLowerCase();
  if (raw === '0' || raw === 'false' || raw === 'off') return false;
  return true;
}

const mirunoDubFallbackPublic = isAnimepaheMirunoDubGapUiEnabled();

export function useWatch(
  animeId: string,
  initialEpisodeId: string | undefined
): UseWatchReturn {
  const [isFullOverview, setIsFullOverview] = useState(false);
  const [streamLangRevision, setStreamLangRevision] = useState(0);
  const [watchStreamProvider, setWatchStreamProviderState] =
    useState<WatchStreamProvider>('animepahe');
  const [streamHardExhausted, setStreamHardExhausted] = useState(false);
  const issuedDubToSubFallbackRef = useRef(false);

  const setWatchStreamProvider = useCallback((next: WatchStreamProvider) => {
    setWatchStreamProviderState(next);
    writeWatchStreamProvider(next);
  }, []);

  /** Новий тайтл — завжди Animepahe; Anilibria лише після явного вибору в плеєрі. */
  useEffect(() => {
    if (!animeId.trim()) return;
    setWatchStreamProvider('animepahe');
  }, [animeId, setWatchStreamProvider]);

  const anime = useWatchAnime(animeId, initialEpisodeId, watchStreamProvider);

  useEffect(() => {
    issuedDubToSubFallbackRef.current = false;
    setStreamHardExhausted(false);
  }, [animeId, anime.episodeId, watchStreamProvider]);

  const playerShellPending =
    anime.animeInfoLoading ||
    anime.episodes === null ||
    (anime.episodeId == null &&
      Array.isArray(anime.episodes) &&
      anime.episodes.length > 0) ||
    (Boolean(anime.episodeId) &&
      Array.isArray(anime.episodes) &&
      anime.episodes.length > 0 &&
      anime.episodes.every(
        (e: EpisodesTypes) => getEpisodeNumberFromId(e.id) !== anime.episodeId
      ));

  const [activeServerId, setActiveServerIdRaw] = useState<string | null>('2');

  useEffect(() => {
    setActiveServerIdRaw('2');
  }, [animeId]);

  const setActiveServerId = useCallback((value: SetStateAction<string | null>) => {
    setActiveServerIdRaw(value);
    setStreamLangRevision((n) => n + 1);
  }, []);

  const streamAnimeMeta = useMemo((): WatchStreamAnimeMeta | null => {
    const a = anime.animeInfo;
    if (!a) return null;
    return {
      id: a.id,
      mal_id: a.mal_id ?? null,
      title: a.title,
    };
  }, [anime.animeInfo?.id, anime.animeInfo?.mal_id, anime.animeInfo?.title]);

  const hasAnyDub = useMemo(
    () => Boolean(anime.episodes?.some((e) => e.hasDub === true)),
    [anime.episodes]
  );

  const currentEpisodeHasDub = useMemo(() => {
    const ep = anime.episodes?.find(
      (e: EpisodesTypes) => getEpisodeNumberFromId(e.id) === anime.episodeId
    );
    return ep?.hasDub === true;
  }, [anime.episodes, anime.episodeId]);

  /**
   * Мова для `watch/resolve`: Anilibria — лише саб.
   * Animepahe: якщо вибрано English (`activeServerId === '2'`), завжди `dub` — інакше
   * при `currentEpisodeHasDub === false` у мережі йшов `lang=sub`, хоча в плеєрі обрано English.
   */
  const resolverLang = useMemo<'sub' | 'dub'>(() => {
    if (watchStreamProvider === 'aniliberty') return 'sub';
    if (activeServerId !== '2') return 'sub';
    return 'dub';
  }, [watchStreamProvider, activeServerId]);

  const preferredLang = useMemo<'sub' | 'dub'>(
    () => (activeServerId === '2' ? 'dub' : 'sub'),
    [activeServerId]
  );

  /** Dub / Anilibria: один прохід без «другого редіректу» — лише `setActiveServerIdRaw`, без `streamLangRevision`. */
  useEffect(() => {
    if (watchStreamProvider === 'aniliberty') {
      if (activeServerId === '2') setActiveServerIdRaw('1');
      return;
    }
    if (mirunoDubFallbackPublic) {
      return;
    }
    if (!hasAnyDub && activeServerId === '2') {
      setActiveServerIdRaw('1');
      return;
    }
  }, [watchStreamProvider, activeServerId, hasAnyDub, mirunoDubFallbackPublic]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_SERVER_TYPE, preferredLang);
  }, [preferredLang]);

  /** Завжди ті самі «дзеркала» для меню мови; Anilibria — окремий провайдер у `setupPlayerReady`. */
  const servers = useMemo<ServerInfo[]>(() => {
    const base: ServerInfo[] = [
      { type: 'sub', data_id: 1, server_id: 1, serverName: 'Japanese' },
    ];
    if (hasAnyDub || mirunoDubFallbackPublic) {
      base.push({
        type: 'dub',
        data_id: 2,
        server_id: 2,
        serverName: 'English',
      });
    }
    return base;
  }, [hasAnyDub, mirunoDubFallbackPublic]);

  const onPlaybackLangResolved = useCallback((lang: 'sub' | 'dub') => {
    setActiveServerIdRaw(lang === 'dub' ? '2' : '1');
  }, []);

  const episodeDubStateKey = useMemo(
    () =>
      `${anime.episodeId ?? ''}:${
        currentEpisodeHasDub === true ? '1' : '0'
      }:${hasAnyDub ? '1' : '0'}`,
    [anime.episodeId, currentEpisodeHasDub, hasAnyDub]
  );

  const watchResolveOptions = useMemo(
    () => ({
      animeId,
      episodeId: anime.episodeId,
      streamAnime: streamAnimeMeta,
      providerAnimeId:
        watchStreamProvider === 'aniliberty'
          ? anime.anilibertyCatalogProviderId
          : anime.animepaheCatalogProviderId,
      preferredLang: resolverLang,
      onPlaybackLangResolved,
      watchStreamProvider,
      streamLangRevision,
      episodeDubStateKey,
    }),
    [
      streamAnimeMeta,
      anime.episodeId,
      anime.animepaheCatalogProviderId,
      anime.anilibertyCatalogProviderId,
      animeId,
      watchStreamProvider,
      resolverLang,
      onPlaybackLangResolved,
      streamLangRevision,
      episodeDubStateKey,
    ]
  );

  const stream = useWatchStream(watchResolveOptions);

  /**
   * Dub (English) часто падає через блокування/відсутність джерел — автоматично
   * перемикаємо на Japanese (sub), найстабільніший варіант на Animepahe.
   */
  useEffect(() => {
    if (!stream.resolveAttempted || stream.buffering) return;
    if (stream.streamUrl) return;
    if (!stream.errorCode) return;
    if (watchStreamProvider !== 'animepahe') return;
    if (activeServerId !== '2') return;
    if (resolverLang !== 'dub') return;

    const code = stream.errorCode.toLowerCase();
    if (code.includes('episode_not_found')) return;
    if (code.includes('animepahe_sources_empty')) return;
    if (code.includes('episode is required')) return;
    if (code.includes('lang must')) return;
    if (code.includes('watch_resolve_invalid_json')) return;
    if (code.includes('watch_resolve_empty')) return;

    issuedDubToSubFallbackRef.current = true;
    setActiveServerIdRaw('1');
  }, [
    stream.resolveAttempted,
    stream.buffering,
    stream.streamUrl,
    stream.errorCode,
    watchStreamProvider,
    activeServerId,
    resolverLang,
  ]);

  useEffect(() => {
    if (!stream.streamUrl) return;
    issuedDubToSubFallbackRef.current = false;
    setStreamHardExhausted(false);
  }, [stream.streamUrl]);

  useEffect(() => {
    if (!issuedDubToSubFallbackRef.current) return;
    if (!stream.resolveAttempted || stream.buffering || stream.streamUrl) return;
    if (watchStreamProvider !== 'animepahe') return;
    if (activeServerId !== '1' || resolverLang !== 'sub') return;
    if (!stream.errorCode) return;

    setStreamHardExhausted(true);
  }, [
    stream.resolveAttempted,
    stream.buffering,
    stream.streamUrl,
    stream.errorCode,
    watchStreamProvider,
    activeServerId,
    resolverLang,
  ]);

  const streamOverlayMessage = useMemo((): { title: string; subtitle: string } | null => {
    if (playerShellPending || stream.buffering || stream.streamUrl) return null;

    const catalogErr = anime.error?.trim();
    if (catalogErr) {
      return {
        title: 'Could not load this title.',
        subtitle: catalogErr,
      };
    }

    if (!stream.resolveAttempted) return null;

    if (streamHardExhausted) {
      return {
        title: 'Playback could not be started.',
        subtitle:
          'You may have hit a temporary rate limit from switching stream sources, or the streaming server is unavailable. Please wait and try again, or pick another episode.',
      };
    }

    return {
      title: 'This player is currently unavailable.',
      subtitle:
        'Please try another episode, change server or provider, or try again later.',
    };
  }, [
    playerShellPending,
    stream.buffering,
    stream.streamUrl,
    stream.resolveAttempted,
    streamHardExhausted,
    anime.error,
  ]);

  const episodesForUi = streamHardExhausted ? [] : anime.episodes;
  const totalEpisodesForUi = streamHardExhausted ? 0 : anime.totalEpisodes;

  const activeEpisodeNum = useMemo((): number | null => {
    const { episodes, episodeId } = anime;
    if (!episodes?.length || !episodeId) return null;
    const ep = episodes.find(
      (e: EpisodesTypes) => getEpisodeNumberFromId(e.id) === episodeId
    );
    return ep?.episode_no ?? null;
  }, [anime.episodes, anime.episodeId]);

  const error = anime.error ?? stream.error ?? null;

  return {
    error,
    buffering: stream.buffering,
    streamInfo: stream.streamInfo,
    animeInfo: anime.animeInfo,
    episodes: episodesForUi,
    nextEpisodeSchedule: anime.nextEpisodeSchedule,
    animeInfoLoading: anime.animeInfoLoading,
    playerShellPending,
    totalEpisodes: totalEpisodesForUi,
    servers,
    streamUrl: stream.streamUrl,
    isFullOverview,
    setIsFullOverview,
    subtitles: stream.subtitles.length ? stream.subtitles : null,
    thumbnail: stream.thumbnail,
    episodeId: anime.episodeId,
    setEpisodeId: anime.setEpisodeId,
    activeEpisodeNum,
    activeServerId,
    setActiveServerId,
    watchStreamProvider,
    setWatchStreamProvider,
    streamErrorCode: stream.errorCode,
    streamOverlayMessage,
    anilibertyLanguageMenuEligible: anime.anilibertyLanguageMenuEligible,
  };
}
