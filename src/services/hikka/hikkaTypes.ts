export type HikkaWatchSource = 'ashdi' | 'tortuga' | 'moon';

export interface HikkaWatchEpisodeRow {
  episode: number;
  video_url: string;
}

export interface HikkaWatchTeamBlock {
  logo?: string;
  episodes: HikkaWatchEpisodeRow[];
}

export interface HikkaWatchTeamIframeSource {
  type: 'team-iframe';
  lang: string;
  teams: Record<string, HikkaWatchTeamBlock>;
}

export interface HikkaWatchV2Response {
  type?: string;
  moon?: HikkaWatchTeamIframeSource;
  ashdi?: HikkaWatchTeamIframeSource;
  tortuga?: HikkaWatchTeamIframeSource;
  vidking?: {
    type?: string;
    lang?: string;
    episodes?: HikkaWatchEpisodeRow[];
  };
}

export interface HikkaEpTokenPayload {
  source: HikkaWatchSource;
  team: string;
  pageUrl: string;
}
