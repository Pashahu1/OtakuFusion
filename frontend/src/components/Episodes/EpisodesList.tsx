"use client";

import { useEffect, useState } from "react";
import { getAnimeEpisodes } from "../../services/getAnimeEpisodes";
import "./EpisodesList.scss";
import { EpisodesCard } from "../shared/Card/EpisodeCard/EpisodeCard";
import { getEpisodesServer } from "../../services/getEpisodesServer";
import { usePagination } from "@/hooks/usePagination";

type props = {
  animeId: string;
};

export const EpisodesList: React.FC<props> = ({ animeId }) => {
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [totalEpisodes, setTotalEpisodes] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const episodesPerPage = 100;
  const { currentEpisodes, totalPages } = usePagination(
    currentPage,
    episodesPerPage,
    episodes
  );

  console.log(episodes);
  useEffect(() => {
    const fetchEpisodes = async () => {
      try {
        const res = await getAnimeEpisodes(animeId);
        setEpisodes(res.data.episodes);
        setTotalEpisodes(res.data.totalEpisodes);
        console.log(res.data);
      } catch {
        console.error("can't get data");
      }
    };
    fetchEpisodes();
  }, []);

  return (
    <aside className="episodes">
      <div className="episodes__content">
        <div className="episodes__search-panel">
          <span>List of Episodes:</span>
          <input
            className="episodes__search-input"
            type="text"
            placeholder="Enter ep or name"
          />
        </div>
        <div>
          {totalPages > 1 && (
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
          )}
        </div>
        <div className="episodes__list">
          {currentEpisodes.map((episode) => (
            <EpisodesCard key={episode.episodeId} episode={episode} />
          ))}
        </div>
      </div>
    </aside>
  );
};
