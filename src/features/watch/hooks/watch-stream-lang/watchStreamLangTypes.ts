import type { MutableRefObject, SetStateAction } from 'react';

import type { ServerInfo } from '@/shared/types/GlobalAnimeTypes';

export interface UseWatchStreamLangResult {
  activeServerId: string | null;
  setActiveServerId: (value: SetStateAction<string | null>) => void;
  setActiveServerIdRaw: (id: string | null) => void;
  servers: ServerInfo[];
  resolverLang: 'sub' | 'dub';
  episodeDubStateKey: string;
  episodeHasDubForResolve: boolean | undefined;
  onPlaybackLangResolved: (lang: 'sub' | 'dub') => void;
  userChoseDub: boolean;
  userChoseDubRef: MutableRefObject<boolean>;
}

export interface LangState {
  animeId: string;
  activeServerId: string | null;
  userChoseDub: boolean;
}
