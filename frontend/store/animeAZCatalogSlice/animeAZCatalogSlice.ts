import { createSlice } from '@reduxjs/toolkit';
import { AzLitsTypes } from '../../types/AzListTypes';
// import { AZList } from "../../types/AnimeTypes";

const initialState: AzLitsTypes = {
  sortOption: '0-9',
  animes: [],
  totalPages: 1,
  currentPage: 1,
  hasNextPage: false,
};

export const animeAZCatalogSlice = createSlice({
  name: 'animeAZPageCatalog',
  initialState,
  reducers: {
    getAZPageCatalog: (state, { payload }) => {
      state.response = payload.response;
      state.pageInfo = payload.pageInfo;
    },
  },
});

export const { actions, reducer } = animeAZCatalogSlice;
