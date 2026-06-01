'use client';

import { useCallback, useRef, useState } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import {
  StreamOriginPreconnect,
  useWatch,
  useWatchPageEffects,
  WatchPlayShell,
} from '@/features/watch';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { onEpisodeWatched as markWatchedInStorage } from '@/lib/watch/watched-episodes';
import './watch-play-page.scss';

export default function WatchPlayPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const animeIdRaw = params?.id;
  const animeId =
    typeof animeIdRaw === 'string'
      ? animeIdRaw
      : Array.isArray(animeIdRaw)
        ? (animeIdRaw[0] ?? '')
        : '';
  const urlEp = searchParams.get('ep') ?? undefined;
  const [showErrorBlock, setShowErrorBlock] = useState(false);

  const [watchedEpisodes, setWatchedEpisodes] = useLocalStorage<Record<string, boolean>>(
    `watched-${animeId}`,
    {}
  );

  const watch = useWatch(animeId || '', urlEp ?? undefined);

  const hasAppliedSavedEpisodeRef = useRef(false);
  const errorBlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useWatchPageEffects(
    hasAppliedSavedEpisodeRef,
    animeId,
    watch.setEpisodeId,
    watch.episodeId,
    watch.episodes,
    urlEp,
    watch.buffering,
    watch.streamUrl,
    watch.playerShellPending,
    watch.animeInfo,
    errorBlockTimerRef,
    setShowErrorBlock
  );

  const onEpisodeWatched = useCallback(
    (id: string) => markWatchedInStorage(id, setWatchedEpisodes),
    [setWatchedEpisodes]
  );

  return (
    <div className="watch-play-page">
      <StreamOriginPreconnect streamUrl={watch.streamUrl} />
      <WatchPlayShell
        animeId={animeId}
        watchedEpisodes={watchedEpisodes}
        onEpisodeWatched={onEpisodeWatched}
        showErrorBlock={showErrorBlock}
        buffering={watch.buffering}
        streamLoadingMessage={watch.streamLoadingMessage}
        streamUrl={watch.streamUrl}
        subtitles={watch.subtitles}
        thumbnail={watch.thumbnail}
        episodeId={watch.episodeId}
        episodes={watch.episodes}
        setEpisodeId={watch.setEpisodeId}
        animeInfo={watch.animeInfo}
        episodeNum={watch.activeEpisodeNum}
        streamInfo={watch.streamInfo}
        servers={watch.servers}
        activeServerId={watch.activeServerId}
        setActiveServerId={watch.setActiveServerId}
        playerShellPending={watch.playerShellPending}
        watchStreamProvider={watch.watchStreamProvider}
        setWatchStreamProvider={watch.setWatchStreamProvider}
        streamOverlayMessage={watch.streamOverlayMessage}
        anilibertyLanguageMenuEligible={watch.anilibertyLanguageMenuEligible}
        hikkaLanguageMenuEligible={watch.hikkaLanguageMenuEligible}
      />
    </div>
  );
}
