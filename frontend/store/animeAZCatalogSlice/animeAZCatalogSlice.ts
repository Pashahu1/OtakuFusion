import { createSlice } from "@reduxjs/toolkit";
import { AzLitsTypes } from "../../types/AzListTypes";
// import { AZList } from "../../types/AnimeTypes";

const initialState: AzLitsTypes = {
  sortOption: "0-9",
  animes: [],
  totalPages: 1,
  currentPage: 1,
  hasNextPage: false,
};

export const animeAZCatalogSlice = createSlice({
  name: "animeAZPageCatalog",
  initialState,
  reducers: {
    getAZPageCatalog: (state, { payload }) => {
      state.sortOption = payload.sortOption;
      state.animes = payload.animes;
      state.totalPages = payload.totalPages;
      state.currentPage = payload.currentPage;
      state.hasNextPage = payload.hasNextPage;
    },
  },
});

export const { actions, reducer } = animeAZCatalogSlice;
