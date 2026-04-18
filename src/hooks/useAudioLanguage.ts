import { useCallback, useMemo } from 'react';
import type { ServerInfo } from '@/shared/types/GlobalAnimeTypes';
import {
  STORAGE_SERVER_NAME,
  STORAGE_SERVER_TYPE,
} from '@/shared/data/servers';

export type AudioLanguage = 'japanese' | 'english';

const TYPE_TO_LANG: Record<string, AudioLanguage> = {
  sub: 'japanese',
  dub: 'english',
};

const LANG_TO_TYPE: Record<AudioLanguage, 'sub' | 'dub'> = {
  japanese: 'sub',
  english: 'dub',
};

function findServerByType(
  servers: ServerInfo[] | null,
  preferredName: string | undefined,
  type: 'sub' | 'dub'
): ServerInfo | undefined {
  if (!servers?.length) return undefined;
  if (preferredName) {
    const sameName = servers.find(
      (s) =>
        s.type === type &&
        s.serverName.toLowerCase() === preferredName.toLowerCase()
    );
    if (sameName) return sameName;
  }
  return servers.find((s) => s.type === type);
}

export interface UseAudioLanguageReturn {
  language: AudioLanguage | null;
  setLanguage: (lang: AudioLanguage) => void;
  hasJapanese: boolean;
  hasEnglish: boolean;
}

export function useAudioLanguage(
  servers: ServerInfo[] | null,
  activeServerId: string | null,
  setActiveServerId: (id: string | null) => void
): UseAudioLanguageReturn {
  const activeServer = useMemo(
    () =>
      servers?.find((s) => String(s.data_id) === String(activeServerId)) ??
      null,
    [servers, activeServerId]
  );

  const language: AudioLanguage | null = useMemo(() => {
    if (!activeServer) return null;
    return TYPE_TO_LANG[activeServer.type] ?? null;
  }, [activeServer]);

  const hasJapanese = useMemo(
    () => Boolean(servers?.some((s) => s.type === 'sub')),
    [servers]
  );

  const hasEnglish = useMemo(
    () => Boolean(servers?.some((s) => s.type === 'dub')),
    [servers]
  );

  const setLanguage = useCallback(
    (lang: AudioLanguage) => {
      if (!servers?.length) return;
      const targetType = LANG_TO_TYPE[lang];
      const target = findServerByType(
        servers,
        activeServer?.serverName,
        targetType
      );
      if (!target) return;
      setActiveServerId(String(target.data_id));
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_SERVER_NAME, target.serverName);
        window.localStorage.setItem(STORAGE_SERVER_TYPE, target.type);
      }
    },
    [servers, activeServer?.serverName, setActiveServerId]
  );

  return { language, setLanguage, hasJapanese, hasEnglish };
}
