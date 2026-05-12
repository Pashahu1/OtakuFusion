import { useCallback, useState } from 'react';
import Image from 'next/image';
import { Player } from '@/features/player';
import { BouncingLoader } from '../ui/Bouncingloader/Bouncingloader';
import type { SubtitleItem } from '@/shared/types/PlayerTypes';
import type { Segment } from '@/shared/types/VideoSegmentsTypes';
import type { StreamingData } from '@/shared/types/StreamingTypes';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { ServerInfo } from '@/shared/types/GlobalAnimeTypes';

type WatchPlayerContentProps = {
  animeId: string;
  playerColumnRef: React.RefObject<HTMLDivElement | null>;
  buffering: boolean;
  streamUrl: string | null;
  subtitles: SubtitleItem[] | null;
  intro: Segment | null;
  outro: Segment | null;
  thumbnail: string | null;
  episodeId: string | null;
  episodes: EpisodesTypes[] | null;
  setEpisodeId: (episodeId: string | null) => void;
  onEpisodeWatched: (episodeId: string) => void;
  animeInfo: AnimeData | null;
  episodeNum: number | null;
  streamInfo: StreamingData | null;
  servers: ServerInfo[] | null;
  activeServerId: string | null;
  setActiveServerId: (id: string | null) => void;
  showErrorBlock: boolean;
  streamNotice: string | null;
  /** Дані для стріму ще підвантажуються — не показувати помилку плеєра. */
  playerShellPending: boolean;
};

export const WatchPlayerContent = ({
  animeId,
  playerColumnRef,
  buffering,
  streamUrl,
  subtitles,
  intro,
  outro,
  thumbnail,
  episodeId,
  episodes,
  setEpisodeId,
  onEpisodeWatched,
  animeInfo,
  streamInfo,
  servers,
  activeServerId,
  setActiveServerId,
  showErrorBlock,
  episodeNum,
  streamNotice,
  playerShellPending,
}: WatchPlayerContentProps) => {
  const streamKey = `${episodeId ?? ''}:${activeServerId ?? ''}:${streamUrl ?? ''}`;
  const noticeResetKey = `${streamNotice ?? ''}:${episodeId ?? ''}:${activeServerId ?? ''}`;

  const [builtinRuntimeError, setBuiltinRuntimeError] = useState(false);
  const [prevStreamKey, setPrevStreamKey] = useState(streamKey);
  if (streamKey !== prevStreamKey) {
    setPrevStreamKey(streamKey);
    setBuiltinRuntimeError(false);
  }

  const [noticeDismissed, setNoticeDismissed] = useState(false);
  const [prevNoticeResetKey, setPrevNoticeResetKey] = useState(noticeResetKey);
  if (noticeResetKey !== prevNoticeResetKey) {
    setPrevNoticeResetKey(noticeResetKey);
    setNoticeDismissed(false);
  }

  const handleBuiltinError = useCallback(() => {
    setBuiltinRuntimeError(true);
  }, []);

  const hasBuiltinError = builtinRuntimeError;

  const isBuiltinReady =
    !playerShellPending && !buffering && Boolean(streamUrl);
  const isBuiltinFailed =
    !playerShellPending && !buffering && !streamUrl;
  const showBuiltinPlayer = !hasBuiltinError && isBuiltinReady;
  const showLoader =
    !hasBuiltinError &&
    (playerShellPending || buffering);
  const isErrorState = isBuiltinFailed || hasBuiltinError;

  /** Лише коли плеєр реально готовий — не показувати amber-блок під час loader / shell. */
  const showStreamNotice =
    Boolean(streamNotice) &&
    !noticeDismissed &&
    isBuiltinReady &&
    !hasBuiltinError;

  return (
    <div
      ref={playerColumnRef}
      className="watch-player flex w-full min-w-0 flex-col gap-0 overflow-x-hidden max-[1199px]:order-1 min-[1200px]:h-[675px] md:max-[1199px]:col-span-2"
    >
      {showStreamNotice && streamNotice ? (
        <div
          role="status"
          className="mb-2 flex items-start justify-between gap-3 rounded-lg border border-amber-500/35 bg-amber-950/40 px-3 py-2 text-sm text-amber-100/95"
        >
          <span className="min-w-0 leading-snug">{streamNotice}</span>
          <button
            type="button"
            onClick={() => setNoticeDismissed(true)}
            className="shrink-0 rounded px-2 py-0.5 text-xs text-amber-200/90 underline-offset-2 hover:underline"
          >
            OK
          </button>
        </div>
      ) : null}
      <div className="player relative h-full w-full shrink-0 overflow-hidden rounded-xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.45)] min-[1401px]:h-full min-[1200px]:max-[1400px]:h-[40vw] max-[1199px]:h-[48vw] md:max-[1199px]:max-h-[520px] max-md:h-[58vw] max-[600px]:h-[65vw]">
        {showLoader && (
          <div className="bg-opacity-50 absolute inset-0 flex items-center justify-center bg-black">
            <BouncingLoader />
          </div>
        )}

        {showBuiltinPlayer && (
          <Player
            key={`${animeId}:${episodeId ?? ''}:${streamUrl}`}
            streamUrl={streamUrl as string}
            subtitles={subtitles}
            intro={intro}
            outro={outro}
            thumbnail={thumbnail}
            episodeId={episodeId}
            episodes={episodes}
            playNext={(id) => setEpisodeId(id)}
            onEpisodeWatched={onEpisodeWatched}
            animeInfo={animeInfo}
            episodeNum={episodeNum}
            streamInfo={streamInfo}
            servers={servers}
            activeServerId={activeServerId}
            setActiveServerId={setActiveServerId}
            onPlaybackError={handleBuiltinError}
          />
        )}

        {isErrorState && (showErrorBlock || hasBuiltinError) && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-1 bg-black/80 text-center">
            <Image
              src="/gojo-player.png"
              alt=""
              width={100}
              height={100}
              className="w-[100px] h-auto max-w-[100px]"
              role="presentation"
            />
            <span>This player is currently unavailable.</span>
            <span>Please try another episode or server.</span>
          </div>
        )}
      </div>
    </div>
  );
};
