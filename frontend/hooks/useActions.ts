import { useMemo } from "react";
import { actions as AnimeHomeActions } from "../store/animeSlice/animeSlice";
import { useDispatch } from "react-redux";
import { bindActionCreators } from "redux";

const rootActions = {
  ...AnimeHomeActions,
};

export const useActions = () => {
  const dispatch = useDispatch();

  return useMemo(() => bindActionCreators(rootActions, dispatch), [dispatch]);
};
