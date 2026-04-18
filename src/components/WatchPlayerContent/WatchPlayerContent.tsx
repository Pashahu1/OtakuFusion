import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { Player } from '../Player/Player';
import { IframePlayer } from '../Player/IframePlayer';
import { BouncingLoader } from '../ui/Bouncingloader/Bouncingloader';
import { getIframePlayerUrl } from '../Player/getIframePlayerUrl';
import { usePlayerMode } from '@/hooks/usePlayerMode';
import { useAudioLanguage, type AudioLanguage } from '@/hooks/useAudioLanguage';
import type { SubtitleItem } from '@/shared/types/PlayerTypes';
import type { Segment } from '@/shared/types/VideoSegmentsTypes';
import type { StreamingData } from '@/shared/types/StreamingTypes';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { ServerInfo } from '@/shared/types/GlobalAnimeTypes';

type WatchPlayerContentProps = {
  playerColumnRef: React.RefObject<HTMLDivElement | null>;
  serverLoading: boolean;
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
};

function getActiveServerType(
  servers: ServerInfo[] | null,
  activeServerId: string | null
): string | null {
  if (!servers || !activeServerId) return null;
  return (
    servers.find((s) => String(s.data_id) === String(activeServerId))?.type ??
    null
  );
}

const LANGUAGE_OPTIONS: { value: AudioLanguage; label: string }[] = [
  { value: 'japanese', label: 'Japanese' },
  { value: 'english', label: 'English' },
];

/**
 * TEMP: force built-in player error until playback is fixed.
 * Set to `false` once HLS playback works.
 */
const FORCE_BUILTIN_ERROR = true;

export const WatchPlayerContent = ({
  playerColumnRef,
  serverLoading,
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
}: WatchPlayerContentProps) => {
  const playerMountKey = useId();
  const { mode, setMode } = usePlayerMode();
  const { language, setLanguage, hasJapanese, hasEnglish } = useAudioLanguage(
    servers,
    activeServerId,
    setActiveServerId
  );

  const activeServerType = getActiveServerType(servers, activeServerId);

  const iframeUrl = useMemo(
    () =>
      getIframePlayerUrl({
        streamInfo,
        episodeId,
        serverType: activeServerType,
      }),
    [streamInfo, episodeId, activeServerType]
  );

  const [builtinRuntimeError, setBuiltinRuntimeError] = useState(false);
  useEffect(() => {
    setBuiltinRuntimeError(false);
  }, [episodeId, activeServerId, streamUrl]);

  const handleBuiltinError = useCallback(() => {
    setBuiltinRuntimeError(true);
  }, []);

  const hasBuiltinError = builtinRuntimeError || FORCE_BUILTIN_ERROR;

  const isBuiltinReady = !serverLoading && !buffering && Boolean(streamUrl);
  const isBuiltinFailed = !serverLoading && !buffering && !streamUrl;

  const shouldUseExternal = mode === 'external';

  const showBuiltinPlayer =
    !shouldUseExternal && !hasBuiltinError && isBuiltinReady;
  const showExternalPlayer = shouldUseExternal && Boolean(iframeUrl);
  const showLoader = shouldUseExternal
    ? !iframeUrl
    : !hasBuiltinError && (serverLoading || buffering);
  const isErrorState =
    !shouldUseExternal && (isBuiltinFailed || hasBuiltinError);

  const canUseLanguage: Record<AudioLanguage, boolean> = {
    japanese: hasJapanese,
    english: hasEnglish,
  };

  return (
    <div
      ref={playerColumnRef}
      className="watch-player flex w-full min-w-0 flex-col gap-0 overflow-x-hidden max-[1199px]:order-1 min-[1200px]:h-[675px] md:max-[1199px]:col-span-2"
    >
      <div className="player relative h-full w-full shrink-0 overflow-hidden rounded-xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.45)] min-[1401px]:h-full min-[1200px]:max-[1400px]:h-[40vw] max-[1199px]:h-[48vw] md:max-[1199px]:max-h-[520px] max-md:h-[58vw] max-[600px]:h-[65vw]">
        <div className="pointer-events-none absolute top-2 right-2 z-20 flex flex-wrap items-center justify-end gap-1.5 text-[11px] text-white/85">
          <div className="pointer-events-auto flex items-center gap-0.5 rounded-lg border border-white/10 bg-black/55 p-1 backdrop-blur-md">
            {LANGUAGE_OPTIONS.map((opt) => {
              const isAvailable = canUseLanguage[opt.value];
              const isActive = language === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => isAvailable && setLanguage(opt.value)}
                  disabled={!isAvailable}
                  className={`rounded-md px-2 py-0.5 transition ${
                    isActive
                      ? 'bg-[#f47521]/85 text-white'
                      : 'hover:bg-white/10'
                  } disabled:cursor-not-allowed disabled:opacity-35`}
                  title={
                    isAvailable
                      ? `Switch audio to ${opt.label}`
                      : `${opt.label} is not available for this episode`
                  }
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <div className="pointer-events-auto flex items-center gap-0.5 rounded-lg border border-white/10 bg-black/55 p-1 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setMode('builtin')}
              className={`rounded-md px-2 py-0.5 transition ${
                mode === 'builtin'
                  ? 'bg-[#f47521]/85 text-white'
                  : 'hover:bg-white/10'
              }`}
            >
              Built-in
            </button>
            <button
              type="button"
              onClick={() => setMode('external')}
              disabled={!iframeUrl}
              className={`rounded-md px-2 py-0.5 transition ${
                mode === 'external'
                  ? 'bg-[#f47521]/85 text-white'
                  : 'hover:bg-white/10'
              } disabled:cursor-not-allowed disabled:opacity-35`}
              title={
                iframeUrl
                  ? 'Switch to external embed player'
                  : 'No external player URL available'
              }
            >
              External
            </button>
          </div>
        </div>

        {showLoader && (
          <div className="bg-opacity-50 absolute inset-0 flex items-center justify-center bg-black">
            <BouncingLoader />
          </div>
        )}

        {showBuiltinPlayer && (
          <Player
            key={playerMountKey}
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

        {showExternalPlayer && iframeUrl && (
          <IframePlayer
            key={`${iframeUrl}-${episodeId ?? ''}`}
            iframeUrl={iframeUrl}
            episodeId={episodeId}
            episodes={episodes}
            playNext={(id) => setEpisodeId(id)}
            onEpisodeWatched={onEpisodeWatched}
          />
        )}

        {isErrorState && (showErrorBlock || hasBuiltinError) && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-1 bg-black/80 text-center">
            <img
              src="/gojo-player.png"
              alt=""
              className="w-[100px]"
              role="presentation"
            />
            <span>This player is currently unavailable.</span>
            <span>Please pick another one from the options above.</span>
          </div>
        )}
      </div>
    </div>
  );
};
