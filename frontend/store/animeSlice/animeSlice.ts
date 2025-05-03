import { createSlice } from "@reduxjs/toolkit";
import { HomeCatalogData } from "../../types/AnimeTypes";

const initialState: HomeCatalogData = {
  spotlight: [],
  trending: [],
  topAiring: [],
  mostPopular: [],
  mostFavorite: [],
  latestCompleted: [],
  latestEpisode: [],
  newAdded: [],
  topUpcoming: [],
  top10: {
    today: [],
    week: [],
    month: [],
  },
  genres: [],
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
