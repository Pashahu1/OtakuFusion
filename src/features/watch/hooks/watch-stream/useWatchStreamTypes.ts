import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import type { SubtitleItem } from '@/shared/types/PlayerTypes';
import type { StreamingData } from '@/shared/types/StreamingTypes';
import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';

export interface UseWatchStreamReturn {
  streamInfo: StreamingData | null;
  streamUrl: string | null;
  buffering: boolean;
  streamLoadingMessage: string | null;
  subtitles: SubtitleItem[];
  thumbnail: string | null;
  error: string | null;
  errorCode: string | null;
  resolveAttempted: boolean;
}

export interface WatchStreamAnimeMeta {
  id: string;
  mal_id: number | null;
  title: string;
}

export interface WatchResolveOptions {
  animeId: string;
  episodeId: string | null;
  streamAnime: WatchStreamAnimeMeta | null;
  providerAnimeId?: string | null;
  episodeEpToken?: string | null;
  episodeHasDub?: boolean;
  preferredLang: 'sub' | 'dub';
  onPlaybackLangResolved?: (lang: 'sub' | 'dub') => void;
  watchStreamProvider: WatchStreamProvider;
  streamLangRevision: number;
  episodeDubStateKey: string;
  expectedEpisodes?: number;
  anilistStillAiring?: boolean;
  providerCatalogPending?: boolean;
  episodesSourceProvider?: WatchStreamProvider | null;
  onAutoRetryExhausted?: () => void;
  anilibertyCatalogVerified?: boolean;
}

export interface WatchStreamResolveRefs {
  resolveOptsRef: MutableRefObject<WatchResolveOptions | undefined>;
  episodeEpTokenRef: MutableRefObject<string | null | undefined>;
  episodeHasDubRef: MutableRefObject<boolean | undefined>;
  lastResolveProviderRef: MutableRefObject<WatchStreamProvider | null>;
}

export interface WatchStreamResolveSetters {
  setStreamInfo: Dispatch<SetStateAction<StreamingData | null>>;
  setStreamUrl: Dispatch<SetStateAction<string | null>>;
  setSubtitles: Dispatch<SetStateAction<SubtitleItem[]>>;
  setThumbnail: Dispatch<SetStateAction<string | null>>;
  setBuffering: Dispatch<SetStateAction<boolean>>;
  setStreamLoadingMessage: Dispatch<SetStateAction<string | null>>;
  setResolveAttempted: Dispatch<SetStateAction<boolean>>;
  setError: Dispatch<SetStateAction<string | null>>;
  setErrorCode: Dispatch<SetStateAction<string | null>>;
}
