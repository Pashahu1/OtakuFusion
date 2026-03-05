import { useState, useEffect, useRef } from 'react';
import getServers from '@/services/getServers.services';
import type { ServerInfo } from '@/shared/types/GlobalAnimeTypes';

const PREFERRED_SERVERS = ['HD-1', 'HD-2'] as const;
const STORAGE_SERVER_NAME = 'server_name';
const STORAGE_SERVER_TYPE = 'server_type';

function getInitialServer(
  servers: ServerInfo[],
  savedName: string | null,
  savedType: string | null
): ServerInfo | undefined {
  if (!servers?.length) return undefined;
  return (
    servers.find(
      (s) => s.serverName === savedName && s.type === savedType
    ) ??
    servers.find((s) => s.serverName === savedName) ??
    servers.find(
      (s) =>
        s.type === savedType && PREFERRED_SERVERS.includes(s.serverName as any)
    ) ??
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

export function useWatchServers(
  animeId: string,
  episodeId: string | null
): UseWatchServersReturn {
  const [servers, setServers] = useState<ServerInfo[] | null>(null);
  const [activeServerId, setActiveServerId] = useState<string | null>(null);
  const [serverLoading, setServerLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isFetchInProgress = useRef(false);

  useEffect(() => {
    if (!episodeId) {
      setServers(null);
      setActiveServerId(null);
      setServerLoading(true);
      return;
    }
    if (isFetchInProgress.current) return;

    const fetchServers = async () => {
      isFetchInProgress.current = true;
      setServerLoading(true);
      try {
        const data = await getServers(animeId, episodeId);
        const filtered =
          data?.filter(
            (s) =>
              PREFERRED_SERVERS.includes(s.serverName as any) ||
              s.type === 'sub' ||
              s.type === 'dub'
          ) ?? [];
        const savedName = localStorage.getItem(STORAGE_SERVER_NAME);
        const savedType = localStorage.getItem(STORAGE_SERVER_TYPE);
        const initial = getInitialServer(filtered, savedName, savedType);
        setServers(filtered);
        setActiveServerId(
          initial?.data_id != null ? String(initial.data_id) : null
        );
      } catch (err) {
        console.error('Error fetching servers:', err);
        setError(getErrorMessage(err));
      } finally {
        setServerLoading(false);
        isFetchInProgress.current = false;
      }
    };
    fetchServers();
  }, [animeId, episodeId]);

  return {
    servers,
    activeServerId,
    setActiveServerId,
    serverLoading,
    error,
  };
}
