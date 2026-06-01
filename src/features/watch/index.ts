
export { useWatch } from './hooks/useWatch';
export { useWatchAnime, type UseWatchAnimeReturn } from './hooks/useWatchAnime/index';
export {
  useWatchStream,
  type UseWatchStreamReturn,
  type WatchStreamAnimeMeta,
} from './hooks/useWatchStream';
export { useWatchPageEffects } from './hooks/useWatchPageEffects';
export { useWatchSeries } from './hooks/useWatchSeries';

export type { WatchStreamProvider } from './lib/watch-provider';
export {
  readWatchStreamProvider,
  writeWatchStreamProvider,
  STORAGE_WATCH_STREAM_PROVIDER,
} from './lib/watch-provider';

export { Episodelist } from './ui/episode-list/Episodelist';
export { WatchPlayShell } from './ui/watch-play/WatchPlayShell';
export { WatchSeriesHero } from './ui/watch-series/WatchSeriesHero';
export { WatchSeriesDetails } from './ui/watch-series/WatchSeriesDetails';
export { useWatchSpotlightArtwork } from './hooks/useWatchSpotlightArtwork';
export { StreamOriginPreconnect } from './ui/StreamOriginPreconnect';
