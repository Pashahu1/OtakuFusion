import { createSlice } from "@reduxjs/toolkit";
import { AZList } from "../../types/AnimeTypes";

const initialState: AZList = {
  pageInfo: {
    totalPages: 0,
    currentPage: 1,
    hasNextPage: false,
  },
  response: [],
};

export const animeAZCatalogSlice = createSlice({
  name: "animeAZPageCatalog",
  initialState,
  reducers: {
    getAZPageCatalog: (state, { payload }) => {
      state.response = payload.response;
      state.pageInfo = payload.pageInfo;
    },
  },
});

export const { actions, reducer } = animeAZCatalogSlice;
