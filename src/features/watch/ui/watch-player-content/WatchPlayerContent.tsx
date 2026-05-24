import { useCallback, useState } from 'react';
import { Player } from '@/features/player';
import { BouncingLoader } from '@/components/ui/Bouncingloader/Bouncingloader';
import type { SubtitleItem } from '@/shared/types/PlayerTypes';
import type { StreamingData } from '@/shared/types/StreamingTypes';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { ServerInfo } from '@/shared/types/GlobalAnimeTypes';
import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';

type WatchPlayerContentProps = {
  animeId: string;
  playerColumnRef: React.RefObject<HTMLDivElement | null>;
  buffering: boolean;
  streamLoadingMessage: string | null;
  streamUrl: string | null;
  subtitles: SubtitleItem[] | null;
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
  showErrorBlock: boolean;

  playerShellPending: boolean;

  streamOverlayMessage: { title: string; subtitle: string } | null;

  anilibertyLanguageMenuEligible: boolean;
  hikkaLanguageMenuEligible: boolean;
};

export const WatchPlayerContent = ({
  animeId,
  playerColumnRef,
  buffering,
  streamLoadingMessage,
  streamUrl,
  subtitles,
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
  showErrorBlock,
  episodeNum,
  playerShellPending,
  streamOverlayMessage,
  anilibertyLanguageMenuEligible,
  hikkaLanguageMenuEligible,
}: WatchPlayerContentProps) => {
  const streamKey = `${animeId}:${episodeId ?? ''}:${watchStreamProvider}:${activeServerId ?? ''}:${streamUrl ?? ''}`;

  const overlayCopy =
    streamOverlayMessage ?? {
      title: 'This player is currently unavailable.',
      subtitle: 'Please try another episode or server.',
    };

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

  const isStreamMissing = !playerShellPending && !buffering && !streamUrl;
  const allowFatalErrorUi =
    isStreamMissing &&
    (showErrorBlock || hasBuiltinError || streamOverlayMessage != null);
  const showBuiltinPlayer = !hasBuiltinError && !isStreamMissing && Boolean(streamUrl);
  const showLoader =
    !hasBuiltinError &&
    (playerShellPending || buffering || !streamUrl) &&
    !allowFatalErrorUi;
  const showErrorOverlay =
    isStreamMissing && (showErrorBlock || hasBuiltinError || streamOverlayMessage != null);

  return (
    <div
      ref={playerColumnRef}
      className="watch-player flex w-full min-w-0 flex-col gap-0 overflow-x-hidden max-[1199px]:order-1 min-[1200px]:h-[675px] md:max-[1199px]:col-span-2"
    >
      <div className="player relative h-full w-full shrink-0 overflow-hidden rounded-xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.45)] min-[1401px]:h-full min-[1200px]:max-[1400px]:h-[40vw] max-[1199px]:h-[48vw] md:max-[1199px]:max-h-[520px] max-md:h-[58vw] max-[600px]:h-[65vw]">
        {showLoader && (
          <div className="pointer-events-none absolute inset-0 z-[1] flex flex-col items-center justify-center gap-3 bg-black/50 px-4 text-center">
            <BouncingLoader />
            {streamLoadingMessage ? (
              <p className="max-w-sm text-sm font-medium text-white/90">
                {streamLoadingMessage}
              </p>
            ) : null}
          </div>
        )}

        {showBuiltinPlayer && (
          <div className="relative z-[2] h-full w-full min-h-0">
          <Player
            key={`${animeId}:${episodeId ?? ''}:${watchStreamProvider}:${activeServerId ?? ''}:${streamUrl}`}
            streamUrl={streamUrl as string}
            subtitles={subtitles}
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
            onPlaybackError={handleBuiltinError}
            anilibertyLanguageMenuEligible={anilibertyLanguageMenuEligible}
            hikkaLanguageMenuEligible={hikkaLanguageMenuEligible}
          />
          </div>
        )}

        {showErrorOverlay && (
          <div className="absolute inset-0 z-[15] flex flex-col items-center justify-center gap-3 bg-black/80 px-4 text-center text-sm text-white/90">
            <span className="text-base font-semibold text-white">{overlayCopy.title}</span>
            <span className="max-w-md text-white/80">{overlayCopy.subtitle}</span>
          </div>
        )}
      </div>
    </div>
  );
};
