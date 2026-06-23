import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import type { SubtitleItem } from '@/shared/types/PlayerTypes';
import type { StreamingData } from '@/shared/types/StreamingTypes';
import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';
import type { WatchResolveResponse } from '@/features/watch/lib/resolve-watch-stream';

import {
  mapResolveToPlayerState,
  type MappedWatchPlayerState,
  type MapResolveToPlayerStateParams,
} from './resolve-player-state/mapResolveToPlayerStateCore';

export type { MappedWatchPlayerState, MapResolveToPlayerStateParams };

export { mapResolveToPlayerState };

export interface ApplyResolveSuccessContext {
  resolveOptsRef: MutableRefObject<
    | {
        streamLangRevision?: number;
        preferredLang?: 'sub' | 'dub';
        onPlaybackLangResolved?: (lang: 'sub' | 'dub') => void;
      }
    | undefined
  >;
  resolveLangRevision: number;
  watchStreamProvider: WatchStreamProvider;
  setStreamInfo: Dispatch<SetStateAction<StreamingData | null>>;
  setStreamUrl: Dispatch<SetStateAction<string | null>>;
  setBoundGenerationKey: Dispatch<SetStateAction<string | null>>;
  setSubtitles: Dispatch<SetStateAction<SubtitleItem[]>>;
  setThumbnail: Dispatch<SetStateAction<string | null>>;
}

export function applyResolveSuccess(
  result: WatchResolveResponse,
  generationKey: string,
  resolveParams: { lang: 'sub' | 'dub' },
  ctx: ApplyResolveSuccessContext,
): void {
  const opts = ctx.resolveOptsRef.current;
  if (opts?.streamLangRevision !== ctx.resolveLangRevision) return;
  if (opts?.preferredLang !== resolveParams.lang) return;

  const mapped = mapResolveToPlayerState({
    result,
    watchStreamProvider: ctx.watchStreamProvider,
  });

  ctx.setStreamInfo(mapped.streamInfo);
  ctx.setStreamUrl(mapped.streamUrl);
  ctx.setBoundGenerationKey(generationKey);
  ctx.setSubtitles(mapped.subtitles);
  ctx.setThumbnail(mapped.thumbnail);

  if (resolveParams.lang !== mapped.resolvedStreamLang) {
    opts?.onPlaybackLangResolved?.(mapped.resolvedStreamLang);
  }
}
