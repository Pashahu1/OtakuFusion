export interface AnimeServerType {
  episodeId: string;
  episodeNo: number;
  sub: Server[];
  dub: Server[];
  raw: Server[];
  selectedServerId: number;
  selectedServerType: string;
  selectedServerName: string;
}

export interface Server {
  serverId: number;
  serverName: string;
}
