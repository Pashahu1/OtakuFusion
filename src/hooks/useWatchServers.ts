import { useState, useEffect } from 'react';
import { getServers } from '@/services/getServers';
import type { ServerInfo } from '@/shared/types/GlobalAnimeTypes';
import {
  PREFERRED_SERVERS,
  SERVER_PRIORITY_ORDER,
  STORAGE_SERVER_NAME,
  STORAGE_SERVER_TYPE,
} from '@/shared/data/servers';

function serverNameMatches(name: string, preferred: string): boolean {
  return name.trim().toLowerCase() === preferred.toLowerCase();
}

function getInitialServer(
  servers: ServerInfo[],
  savedName: string | null,
  savedType: string | null,
  locksOutDub: boolean
): ServerInfo | undefined {
  if (!servers?.length) return undefined;

  if (locksOutDub) {
    return (
      servers.find((s) => s.type.toLowerCase() === 'sub') ??
      servers.find((s) => s.type.toLowerCase() === 'dub') ??
      servers[0]
    );
  }

  const hasDubInList = servers.some((s) => s.type.toLowerCase() === 'dub');
  if (savedType?.toLowerCase() === 'dub' && !hasDubInList) {
    return (
      servers.find((s) => s.type.toLowerCase() === 'sub') ??
      servers.find((s) => s.type.toLowerCase() === 'dub') ??
      servers[0]
    );
  }

  const bySaved =
    savedName != null && savedType != null
      ? servers.find(
          (s) =>
            serverNameMatches(s.serverName, savedName) &&
            s.type.toLowerCase() === savedType.toLowerCase()
        )
      : undefined;
  if (bySaved) return bySaved;

  const bySavedNameOnly =
    savedName != null
      ? servers.find((s) => serverNameMatches(s.serverName, savedName))
      : undefined;
  if (bySavedNameOnly) return bySavedNameOnly;

  const bySavedTypeAndPreferred =
    savedType != null
      ? servers.find(
          (s) =>
            s.type.toLowerCase() === savedType.toLowerCase() &&
            PREFERRED_SERVERS.some((p) => serverNameMatches(s.serverName, p))
        )
      : undefined;
  if (bySavedTypeAndPreferred) return bySavedTypeAndPreferred;

  for (const preferred of SERVER_PRIORITY_ORDER) {
    const found = servers.find((s) =>
      serverNameMatches(s.serverName, preferred)
    );
    if (found) return found;
  }

  return (
    servers.find((s) => s.type === 'sub') ??
    servers.find((s) => s.type === 'dub') ??
    servers[0]
  );
}

export interface UseWatchServersReturn {
  servers: ServerInfo[] | null;
  activeServerId: string | null;
  setActiveServerId: React.Dispatch<React.SetStateAction<string | null>>;
  serverLoading: boolean;
  error: string | null;
}

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'An error occurred.';
}

/** ep_token поточного епізоду (AnimeKai). `locksOutDub` — епізод без dub у метаданих. */
export function useWatchServers(
  epToken: string | null,
  locksOutDub = false
): UseWatchServersReturn {
  const [servers, setServers] = useState<ServerInfo[] | null>(null);
  const [activeServerId, setActiveServerId] = useState<string | null>(null);
  const [serverLoading, setServerLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!epToken) {
      setServers(null);
      setActiveServerId(null);
      setServerLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;
    /** Одразу скинути, щоб useWatchStream не тримав старий data_id для нового ep_token. */
    setServers(null);
    setActiveServerId(null);
    setError(null);
    setServerLoading(true);

    const fetchServers = async () => {
      try {
        const data = await getServers(epToken, signal);
        if (signal.aborted) return;

        const filtered =
          data?.filter(
            (s) =>
              PREFERRED_SERVERS.includes(
                s.serverName as (typeof PREFERRED_SERVERS)[number]
              ) ||
              s.type === 'sub' ||
              s.type === 'dub'
          ) ?? [];
        const savedName = localStorage.getItem(STORAGE_SERVER_NAME);
        const savedType = localStorage.getItem(STORAGE_SERVER_TYPE);
        /**
         * Не писати dub→sub у localStorage: це глобальна вподоба.
         * locksOutDub / епізод без dub у списку API лише обирають sub для *поточного* перегляду;
         * інакше після картки без ?ep= перший епізод «змиває» English для всіх тайтлів.
         */
        setServers(filtered.length ? filtered : data);
        const list = filtered.length ? filtered : data;
        const initial = getInitialServer(list, savedName, savedType, locksOutDub);
        const pick = initial ?? list[0];
        setActiveServerId(pick?.data_id != null ? String(pick.data_id) : null);
      } catch (err) {
        if (signal.aborted) return;
        if (err instanceof Error && err.name === 'AbortError') return;
        console.error('Error fetching servers:', err);
        setError(getErrorMessage(err));
      } finally {
        if (!signal.aborted) setServerLoading(false);
      }
    };
    fetchServers();

    return () => controller.abort();
  }, [epToken, locksOutDub]);

  return {
    servers,
    activeServerId,
    setActiveServerId,
    serverLoading,
    error,
  };
}
