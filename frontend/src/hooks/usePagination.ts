import { EpisodesType } from "@/types/EpisodesListType";

export const usePagination = (
  currentPage: number,
  episodesPerPage: number,
  episodes: EpisodesType[]
) => {
  const indexOfLastEpisode = currentPage * episodesPerPage;
  const indexOfFirstEpisode = indexOfLastEpisode - episodesPerPage;
  const currentEpisodes = episodes.slice(
    indexOfFirstEpisode,
    indexOfLastEpisode
  );

  const totalPages = Math.ceil(episodes.length / episodesPerPage);

  return { currentEpisodes, totalPages };
};
