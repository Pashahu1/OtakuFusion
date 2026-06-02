import { useCallback, useEffect, useMemo, useState } from 'react';
import { Player } from '@/features/player';
import { BouncingLoader } from '@/components/ui/Bouncingloader/Bouncingloader';
import type { SubtitleItem } from '@/shared/types/PlayerTypes';
import type { StreamingData } from '@/shared/types/StreamingTypes';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { ServerInfo } from '@/shared/types/GlobalAnimeTypes';
import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';
import './WatchPlayerContent.scss';

type WatchPlayerContentProps = {
  animeId: string;
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
  const streamKey = useMemo(
    () => `${animeId}:${episodeId ?? ''}:${watchStreamProvider}:${activeServerId ?? ''}:${streamUrl ?? ''}`,
    [animeId, episodeId, watchStreamProvider, activeServerId, streamUrl]
  );

  const overlayCopy =
    streamOverlayMessage ?? {
      title: 'This player is currently unavailable.',
      subtitle: 'Please try another episode or server.',
    };

  const [builtinRuntimeError, setBuiltinRuntimeError] = useState(false);
  const [prevStreamKey, setPrevStreamKey] = useState<string | null>(null);

  useEffect(() => {
    if (prevStreamKey === streamKey) return;
    setPrevStreamKey(streamKey);
    setBuiltinRuntimeError(false);
  }, [prevStreamKey, streamKey]);

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
    <div className="watch-player-content">
      <div className="watch-player-content__frame">
        {showLoader && (
          <div className="watch-player-content__loader">
            <BouncingLoader />
            {streamLoadingMessage ? (
              <p className="watch-player-content__loader-msg">{streamLoadingMessage}</p>
            ) : null}
          </div>
        )}

        {showBuiltinPlayer && (
          <div className="watch-player-content__player">
            <Player
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
          <div className="watch-player-content__error">
            <span className="watch-player-content__error-title">{overlayCopy.title}</span>
            <span className="watch-player-content__error-sub">{overlayCopy.subtitle}</span>
          </div>
        )}
      </div>
    </div>
  );
};
