import { useMemo } from "react";
import { actions as AnimeHomeActions } from "../store/animeSlice/animeSlice";
import { actions as AnimeAZActions } from "../store/animeAZCatalogSlice/animeAZCatalogSlice";
import { useDispatch } from "react-redux";
import { bindActionCreators } from "redux";

const rootActions = {
  ...AnimeHomeActions,
  ...AnimeAZActions,
};

export const useActions = () => {
  const dispatch = useDispatch();

  return useMemo(() => bindActionCreators(rootActions, dispatch), [dispatch]);
};
