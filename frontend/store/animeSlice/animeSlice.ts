import { createSlice } from "@reduxjs/toolkit";
import { HomeCatalog } from "../../types/AnimeTypes";

const initialState: HomeCatalog = {
  genres: [],
  latestCompleted: [],
  latestEpisode: [],
  mostFavorite: [],
  mostPopular: [],
  newAdded: [],
  spotlight: [],
  top10: { today: [], week: [], month: [] },
  topAiring: [],
  topUpcoming: [],
  trending: [],
};

export const animeHomeSlice = createSlice({
  name: "animeHomeCatalog",
  initialState,
  reducers: {
    setAnimeHomeCatalog: (state, { payload }) => {
      return payload;
    },
  },
});

export const { actions, reducer } = animeHomeSlice;
