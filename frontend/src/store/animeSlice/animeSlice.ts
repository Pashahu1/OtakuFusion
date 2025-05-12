import { createSlice } from "@reduxjs/toolkit";
import { HomePageType } from "../../types/HomePageTypes";

const initialState: HomePageType = {
  genres: [],
  latestEpisodeAnimes: [],
  spotlightAnimes: [],
  top10Animes: {
    today: [],
    week: [],
    month: [],
  },
  topAiringAnimes: [],
  topUpcomingAnimes: [],
  trendingAnimes: [],
  mostPopularAnimes: [],
  mostFavoriteAnimes: [],
  latestCompletedAnimes: [],
};

export const animeHomeSlice = createSlice({
  name: "animeHomeCatalog",
  initialState,
  reducers: {
    getHomeCatalog: (state, { payload }) => {
      return payload;
    },
  },
});

export const { actions, reducer } = animeHomeSlice;
