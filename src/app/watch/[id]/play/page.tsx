'use client';

import { useCallback, useRef, useState } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import {
  StreamOriginPreconnect,
  useWatch,
  useWatchPageEffects,
  WatchPlayShell,
} from '@/features/watch';
import { appendWatchActivity } from '@/features/profile';
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

  const errorBlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasAppliedSavedEpisodeRef = useRef(false);

  useWatchPageEffects(
    animeId,
    watch.setEpisodeId,
    watch.episodeId,
    watch.episodes,
    urlEp,
    hasAppliedSavedEpisodeRef,
    watch.buffering,
    watch.streamUrl,
    watch.playerShellPending,
    watch.animeInfo,
    errorBlockTimerRef,
    setShowErrorBlock,
  );

  const onEpisodeWatched = useCallback(
    (id: string) => {
      markWatchedInStorage(id, setWatchedEpisodes);
      const info = watch.animeInfo;
      if (!info?.id) return;
      appendWatchActivity({
        animeId: info.id,
        data_id: info.data_id,
        title: info.title ?? info.japanese_title,
        poster: info.poster,
        episodeId: id,
        episodeNum: watch.activeEpisodeNum,
        genres: info.animeInfo?.Genres,
      });
    },
    [setWatchedEpisodes, watch.animeInfo, watch.activeEpisodeNum],
  );

  return (
    <div className="watch-play-page">
      <StreamOriginPreconnect streamUrl={watch.streamUrl} streamInfo={watch.streamInfo} />
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
        anikotoLanguageMenuEligible={watch.anikotoLanguageMenuEligible}
        playbackLang={watch.playbackLang}
        nextEpisodeSchedule={watch.nextEpisodeSchedule}
      />
    </div>
  );
}
