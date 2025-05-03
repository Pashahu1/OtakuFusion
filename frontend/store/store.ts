import { configureStore } from "@reduxjs/toolkit";
import { reducer as AnimeHomeReducer } from "./animeSlice/animeSlice";
import { reducer as AnimeAZReducer } from "./animeAZCatalogSlice/animeAZCatalogSlice";

export const store = configureStore({
  reducer: {
    animeHomeCatalog: AnimeHomeReducer,
    animeAzList: AnimeAZReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
