import { useId } from 'react';
import { Player } from '../Player/Player';
import { BouncingLoader } from '../ui/Bouncingloader/Bouncingloader';
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
  const isErrorState = !serverLoading && !buffering && !streamUrl;
  return (
    <div
      ref={playerColumnRef}
      className="watch-player flex w-full min-w-0 flex-col gap-0 overflow-x-hidden max-[1200px]:order-1 lg:h-[675px]"
    >
      <div className="player relative h-full w-full shrink-0 overflow-hidden rounded-xl border border-white/5 shadow-[0_12px_40px_rgba(0,0,0,0.45)] max-[1400px]:h-[40vw] max-[1200px]:h-[48vw] max-[1024px]:h-[58vw] max-[600px]:h-[65vw]">
        {(serverLoading || buffering) && (
          <div className="bg-opacity-50 absolute inset-0 flex items-center justify-center bg-black">
            <BouncingLoader />
          </div>
        )}

        {!serverLoading && !buffering && streamUrl && (
          <Player
            key={playerMountKey}
            streamUrl={streamUrl}
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
          />
        )}

        {showErrorBlock && isErrorState && (
          <div className="bg-opacity-50 absolute inset-0 flex flex-col items-center justify-center bg-black text-center">
            <img
              src="/gojo-player.png"
              alt=""
              className="w-[100px]"
              role="presentation"
            />
            <span>Servers now is not Available</span>
            <span>Please try again later or change Server below</span>
          </div>
        )}
      </div>
    </div>
  );
};
