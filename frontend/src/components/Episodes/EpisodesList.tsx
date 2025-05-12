"use client";

import { useEffect, useState } from "react";
import { getAnimeEpisodes } from "../../services/getAnimeEpisodes";
import "./EpisodesList.scss";
import { EpisodesCard } from "../shared/Card/EpisodeCard/EpisodeCard";
import { getEpisodesServer } from "../../services/getEpisodesServer";

type props = {
  animeId: string;
};

export const EpisodesList: React.FC<props> = ({ animeId }) => {
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [totalEpisodes, setTotalEpisodes] = useState("");

  useEffect(() => {
    const fetchEpisodes = async () => {
      try {
        const res = await getAnimeEpisodes(animeId);
        setEpisodes(res.data.episodes);
        setTotalEpisodes(res.data.totalEpisodes);
      } catch {
        console.error("can't get data");
      }
    };
    fetchEpisodes();
  }, []);

  return (
    <aside className="episodes">
      <div className="episodes__content">
        <div></div>
        <div className="episodes__list">
          {episodes.map((episode) => (
            <EpisodesCard key={episode.episodeId} episode={episode} />
          ))}
        </div>
      </div>
    </aside>
  );
};
