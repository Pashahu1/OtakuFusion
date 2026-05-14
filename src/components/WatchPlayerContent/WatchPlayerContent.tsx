import { useCallback, useState } from 'react';
import { Player } from '@/features/player';
import { BouncingLoader } from '../ui/Bouncingloader/Bouncingloader';
import type { SubtitleItem } from '@/shared/types/PlayerTypes';
import type { Segment } from '@/shared/types/VideoSegmentsTypes';
import type { StreamingData } from '@/shared/types/StreamingTypes';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { ServerInfo } from '@/shared/types/GlobalAnimeTypes';
import type { WatchStreamProvider } from '@/lib/watch-provider';

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
  watchStreamProvider: WatchStreamProvider;
  setWatchStreamProvider: (p: WatchStreamProvider) => void;
  anilibertyAlias: string | null;
  showErrorBlock: boolean;
  /** Дані для стріму ще підвантажуються — не показувати помилку плеєра. */
  playerShellPending: boolean;
  showStreamRecovery: boolean;
  onStreamRecoveryChoice: (choice: 'japanese' | 'english' | 'aniliberty') => void;
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
  watchStreamProvider,
  setWatchStreamProvider,
  anilibertyAlias,
  showErrorBlock,
  episodeNum,
  playerShellPending,
  showStreamRecovery,
  onStreamRecoveryChoice,
}: WatchPlayerContentProps) => {
  const streamKey = `${animeId}:${episodeId ?? ''}:${activeServerId ?? ''}:${streamUrl ?? ''}`;

  const hasAnyDub = Boolean(episodes?.some((e) => e.hasDub === true));

  const [builtinRuntimeError, setBuiltinRuntimeError] = useState(false);
  const [prevStreamKey, setPrevStreamKey] = useState(streamKey);
  if (streamKey !== prevStreamKey) {
    setPrevStreamKey(streamKey);
    setBuiltinRuntimeError(false);
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
  const isErrorState = isBuiltinFailed || hasBuiltinError;
  /**
   * Після появи `streamUrl` вбудований плеєр має показувати власний стан (Artplayer/Hls).
   * Не тримаємо зовнішній лоадер до `playing` — він лишався через `!playerSurfaceReady` і міг перекривати/блокувати кліки.
   */
  const showLoader =
    !hasBuiltinError &&
    !isErrorState &&
    (playerShellPending || buffering || !streamUrl);

  return (
    <div
      ref={playerColumnRef}
      className="watch-player flex w-full min-w-0 flex-col gap-0 overflow-x-hidden max-[1199px]:order-1 min-[1200px]:h-[675px] md:max-[1199px]:col-span-2"
    >
      <div className="player relative h-full w-full shrink-0 overflow-hidden rounded-xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.45)] min-[1401px]:h-full min-[1200px]:max-[1400px]:h-[40vw] max-[1199px]:h-[48vw] md:max-[1199px]:max-h-[520px] max-md:h-[58vw] max-[600px]:h-[65vw]">
        {showLoader && (
          <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center bg-black/50">
            <BouncingLoader />
          </div>
        )}

        {showBuiltinPlayer && (
          <div className="relative z-[2] h-full w-full min-h-0">
          <Player
            key={`${animeId}:${episodeId ?? ''}:${activeServerId ?? ''}:${streamUrl}`}
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
            watchStreamProvider={watchStreamProvider}
            setWatchStreamProvider={setWatchStreamProvider}
            anilibertyAlias={anilibertyAlias}
            onPlaybackError={handleBuiltinError}
          />
          </div>
        )}

        {isErrorState &&
          (showErrorBlock || hasBuiltinError || showStreamRecovery) && (
          <div className="absolute inset-0 z-[15] flex flex-col items-center justify-center gap-3 bg-black/80 px-4 text-center">
            <img
              src="/gojo-player.png"
              alt=""
              width={100}
              height={100}
              decoding="async"
              className="mx-auto block max-h-[100px] max-w-[100px] object-contain"
            />
            <span>This player is currently unavailable.</span>
            <span>Please try another episode or server.</span>
            {showStreamRecovery ? (
              <div className="mt-2 flex max-w-md flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
                <button
                  type="button"
                  className="rounded-lg border border-white/20 bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-[#f47521]/45 hover:bg-[#f47521]/10"
                  onClick={() => onStreamRecoveryChoice('japanese')}
                >
                  Japanese (sub)
                </button>
                <button
                  type="button"
                  disabled={!hasAnyDub}
                  className="rounded-lg border border-white/20 bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-[#f47521]/45 hover:bg-[#f47521]/10 disabled:cursor-not-allowed disabled:opacity-40"
                  onClick={() => onStreamRecoveryChoice('english')}
                >
                  English (dub)
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};
