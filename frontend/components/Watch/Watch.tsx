"use client";

import { useEffect, useState } from "react";
import { getEpisodes } from "../../api/getEpisodes"; // путь отредактируй по своему проекту
import { Episode } from "../../types/AnimeTypes";

export const Watch: React.FC<{ animeId: string }> = ({ animeId }) => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const data = await getEpisodes(animeId);
      if (data.length === 0) {
        setError("Эпизоды не найдены");
      }
      setEpisodes(data);
      setLoading(false);
    };

    fetchData();
  }, [animeId]);

  const handleEpisodeClick = (id: string) => {
    setSelectedEpisode(id);
  };

  return (
    <div className="anime-player">
      <h1>Аниме Плеер</h1>

      {loading && <p>Загрузка...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="episode-list">
        {!loading && episodes.length === 0 && !error && (
          <p>Нет эпизодов для отображения.</p>
        )}

        {episodes.map((episode) => (
          <div
            key={episode.episodeId}
            className="episode-item"
            onClick={() => handleEpisodeClick(episode.episodeId)}
          >
            <h2>{episode.title}</h2>
          </div>
        ))}
      </div>

      {selectedEpisode && (
        <div className="player">
          <h3>Просмотр эпизода: {selectedEpisode}</h3>
          <iframe
            src={`https://example.com/watch/${selectedEpisode}`} // замени на актуальную ссылку
            width="800"
            height="450"
            frameBorder="0"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
};
