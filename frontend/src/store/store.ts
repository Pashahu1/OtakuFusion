import { configureStore } from "@reduxjs/toolkit";
import { reducer as AnimeHomeReducer } from "./animeSlice/animeSlice";

export const store = configureStore({
  reducer: {
    animeHomeCatalog: AnimeHomeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
