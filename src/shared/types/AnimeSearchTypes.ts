import type { TvInfo } from "./GlobalAnimeTypes";

export interface AnimeSearchResponse {
    id:string,
    data_id: number,
    poster: string,
    title: string;
    japanese_title: string,
    tvInfo: TvInfo
}
