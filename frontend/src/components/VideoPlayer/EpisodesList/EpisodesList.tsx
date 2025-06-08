"use client";

import { useState } from "react";
import "./EpisodesList.scss";
import { EpisodesButton } from "../EpisodeButton/EpisodesButton";
import { EpisodesType } from "@/types/EpisodesListType";
import { usePagination } from "@/hooks/usePagination";

type props = {
  episodes: EpisodesType[];
  totalEpisodes: number;
  selected: string;
  onSelected: (id: string) => void;
};

export const EpisodesList: React.FC<props> = ({
  episodes,
  totalEpisodes,
  onSelected,
  selected,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const episodesPerPage = 100;

  const { currentEpisodes, totalPages } = usePagination(
    currentPage,
    episodesPerPage,
    episodes
  );

  return (
    <section className="episodes">
      <div className="episodes__content">
        <h3>List of Episodes</h3>
        {totalEpisodes > 100 && (
          <div>
            <div className="pagination">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={currentPage === i + 1 ? "active" : ""}
                >
                  {i * episodesPerPage + 1}
                  {" - "}
                  {Math.min((i + 1) * episodesPerPage, episodes.length)}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="episodes__list">
          {currentEpisodes.map((episode) => (
            <EpisodesButton
              onSelected={() => onSelected(episode.episodeId)}
              key={episode.number}
              episode={episode}
              selected={selected}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
