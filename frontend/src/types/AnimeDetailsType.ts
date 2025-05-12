import { AnimeBase, Episodes } from "./GlobalTypes";

export interface AnimeDetailsType {
  anime: AnimeInfo;
  mostPopularAnimes: AnimeBase[];
  recommendedAnimes: AnimeBase[];
  relatedAnimes: AnimeBase[];
  seasons: Season[];
}

export interface AnimeInfo {
  info: InfoType;
  moreInfo: MoreInfoType;
}

export interface InfoType {
  anilistId: number;
  charactersVoiceActors: CharactersVoiceActorsType[];
  description: string;
  id: string;
  malId: number;
  name: string;
  poster: string;
  stats: StatsType;
  promotionalVideos: PromotionalVideo[];
}

export interface StatsType {
  rating: string;
  quality: string;
  episodes: Episodes;
  type: string;
  duration: string;
}

export interface MoreInfoType {
  aired: string;
  duration: string;
  genres: string[];
  japanese: string;
  malscore: string;
  premiered: string;
  producers: string[];
  status: string;
  studios: string;
  synonyms: string;
}

export interface CharactersVoiceActorsType {
  character: CharacterType;
  voiceActor: VoiceActorType;
}

export interface CharacterType {
  cast: string;
  id: string;
  name: string;
  poster: string;
}

export interface VoiceActorType {
  cast: string;
  id: string;
  name: string;
  poster: string;
}

export interface PromotionalVideo {
  title: string | undefined;
  source: string | undefined;
  thumbnail: string | undefined;
}

export interface Season {
  id: string;
  name: string;
  title: string;
  poster: string;
  isCurrent: boolean;
}
