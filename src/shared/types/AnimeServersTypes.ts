import type { ServerInfo } from "./GlobalAnimeTypes";

export interface Season {
  servers: ServerInfo[];
  activeEpisodeNum: number;
  activeServerId: string | number;
  setActiveServerId: (id: string | number) => void;
  serverLoading: boolean;
}

export interface AnimeServerType {
  servers: Server[];
  activeEpisodeNum: number;
  activeServerId: string | number;
  setActiveServerId: (id: string | number) => void;
  serverLoading: boolean;
}

export interface Server {
  type: string;
  data_id: number;
  server_id: number;
  serverName: string;
}
