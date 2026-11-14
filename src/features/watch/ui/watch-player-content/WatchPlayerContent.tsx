import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Player } from '@/features/player';
import { LoaderSpinner } from '@/components/ui/InitialLoader/InitialLoader';
import type { SubtitleItem } from '@/shared/types/PlayerTypes';
import type { StreamingData } from '@/shared/types/StreamingTypes';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { ServerInfo } from '@/shared/types/GlobalAnimeTypes';
import type { WatchPlaybackAudio } from '@/features/watch/lib/playback-audio';
import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';
import { nextEligibleWatchPlaybackProvider } from '@/features/watch/lib/watch-provider-fallback';
import { WatchPlayerErrorControls } from './WatchPlayerErrorControls';
import { resolveWatchPlayerPhase } from './resolveWatchPlayerPhase';
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
  playbackAudio: WatchPlaybackAudio;
  setPlaybackAudio: (audio: WatchPlaybackAudio) => void;
  anikotoJapaneseEligible: boolean;
  anikotoEnglishEligible: boolean;
  showErrorBlock: boolean;
  playerShellPending: boolean;
  streamOverlayMessage: { title: string; subtitle: string } | null;
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
  playbackAudio,
  setPlaybackAudio,
  anikotoJapaneseEligible,
  anikotoEnglishEligible,
  showErrorBlock,
  episodeNum,
  playerShellPending,
  streamOverlayMessage,
  hikkaLanguageMenuEligible,
}: WatchPlayerContentProps) => {
  const streamKey = useMemo(
    () =>
      `${animeId}:${episodeId ?? ''}:${watchStreamProvider}:${playbackAudio}:${activeServerId ?? ''}:${streamUrl ?? ''}`,
    [animeId, episodeId, watchStreamProvider, playbackAudio, activeServerId, streamUrl]
  );

  const overlayCopy =
    streamOverlayMessage ?? {
      title: 'Playback could not continue.',
      subtitle:
        'The Ukrainian stream hit a temporary rate limit. Wait a moment and try again, or switch source if another is listed.',
    };

  const [builtinErrorStreamKey, setBuiltinErrorStreamKey] = useState<string | null>(null);
  const playbackFallbackTokenRef = useRef<string | null>(null);

  useEffect(() => {
    playbackFallbackTokenRef.current = null;
  }, [animeId, episodeId]);

  const hasBuiltinError = builtinErrorStreamKey === streamKey;

  const handleBuiltinError = useCallback(() => {
    const token = `${animeId}:${episodeId ?? ''}:${watchStreamProvider}`;
    if (playbackFallbackTokenRef.current !== token) {
      const next = nextEligibleWatchPlaybackProvider({
        current: watchStreamProvider,
        hikkaLanguageMenuEligible,
      });
      if (next) {
        playbackFallbackTokenRef.current = token;
        setWatchStreamProvider(next);
        return;
      }
    }
    setBuiltinErrorStreamKey(streamKey);
  }, [
    animeId,
    episodeId,
    watchStreamProvider,
    hikkaLanguageMenuEligible,
    setWatchStreamProvider,
    streamKey,
  ]);

  const phase = resolveWatchPlayerPhase({
    playerShellPending,
    buffering,
    streamUrl,
    showErrorBlock,
    hasBuiltinError,
    streamOverlayMessage,
  });

  return (
    <div className="watch-player-content">
      <div className="watch-player-content__frame">
        {phase === 'loading' && (
          <div className="watch-player-content__loader">
            <LoaderSpinner />
            {streamLoadingMessage ? (
              <p className="watch-player-content__loader-msg">{streamLoadingMessage}</p>
            ) : null}
          </div>
        )}

        {phase === 'playing' && (
          <div className="watch-player-content__player">
            <Player
              localAnimeId={animeId}
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
              playbackAudio={playbackAudio}
              setPlaybackAudio={setPlaybackAudio}
              anikotoJapaneseEligible={anikotoJapaneseEligible}
              anikotoEnglishEligible={anikotoEnglishEligible}
              onPlaybackError={handleBuiltinError}
              hikkaLanguageMenuEligible={hikkaLanguageMenuEligible}
            />
          </div>
        )}

        {phase === 'error' && (
          <div className="watch-player-content__error">
            <span className="watch-player-content__error-title">{overlayCopy.title}</span>
            <span className="watch-player-content__error-sub">{overlayCopy.subtitle}</span>
            <WatchPlayerErrorControls
              setWatchStreamProvider={setWatchStreamProvider}
              setActiveServerId={setActiveServerId}
              setPlaybackAudio={setPlaybackAudio}
              playbackAudio={playbackAudio}
              anikotoJapaneseEligible={anikotoJapaneseEligible}
              anikotoEnglishEligible={anikotoEnglishEligible}
              hikkaLanguageMenuEligible={hikkaLanguageMenuEligible}
            />
          </div>
        )}
      </div>
    </div>
  );
};
